import OpenAI from 'openai';
import type { EducationalTrack } from '../types';

/**
 * Learning Path Recommendation Service
 * Provides personalized educational track recommendations based on user's financial situation
 */

export interface LearningPathRecommendation {
  track: EducationalTrack;
  relevanceScore: number; // 0-1
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserFinancialContext {
  fisScore?: {
    overallScore: number;
    savingsRate: number;
    investmentRate: number;
  };
  hasDebt: boolean;
  hasSavings: boolean;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  completedTrackIds: string[];
  currentLevel: number;
  language?: string;
}

export class LearningPathService {
  constructor(
    private openai: OpenAI,
    private model: string = 'gpt-4-turbo-preview'
  ) {}

  /**
   * Recommend educational tracks based on user's financial situation
   */
  async recommendTracks(
    context: UserFinancialContext,
    availableTracks: EducationalTrack[],
    limit: number = 3
  ): Promise<LearningPathRecommendation[]> {
    // Filter out already completed tracks
    const uncompletedTracks = availableTracks.filter(
      (track) => !context.completedTrackIds.includes(track.id)
    );

    if (uncompletedTracks.length === 0) {
      return [];
    }

    // Build contextual prompt
    const prompt = this.buildRecommendationPrompt(context, uncompletedTracks);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(context.language),
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        return this.fallbackRecommendations(context, uncompletedTracks, limit);
      }

      // Parse GPT-4 response
      const recommendations = this.parseRecommendations(
        content,
        uncompletedTracks
      );

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      return this.fallbackRecommendations(context, uncompletedTracks, limit);
    }
  }

  /**
   * Build system prompt for the AI
   */
  private buildSystemPrompt(language?: string): string {
    const lang = language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English';

    return `You are a financial education advisor specializing in personalized learning paths.
Your task is to analyze a user's financial situation and recommend the most relevant educational tracks.

Respond in ${lang}.

Guidelines:
1. Consider the user's current financial health (FIS score, debt, savings)
2. Recommend tracks that address their specific needs
3. Consider their skill level and completed tracks
4. Prioritize based on urgency and impact
5. Provide clear reasoning for each recommendation

Return recommendations as a JSON array with this structure:
[
  {
    "trackId": "track-id",
    "relevanceScore": 0.95,
    "reasoning": "Clear explanation of why this track is relevant",
    "priority": "high"
  }
]

Priority levels:
- high: Critical financial knowledge gaps
- medium: Important for financial improvement
- low: Nice to have for advanced learning`;
  }

  /**
   * Build recommendation prompt with user context
   */
  private buildRecommendationPrompt(
    context: UserFinancialContext,
    tracks: EducationalTrack[]
  ): string {
    const situationSummary = this.buildSituationSummary(context);
    const tracksList = tracks
      .map(
        (t) =>
          `- ${t.id}: ${t.title} (${t.category}, ${t.difficulty})\n  Description: ${t.description}`
      )
      .join('\n');

    return `User's Financial Situation:
${situationSummary}

Completed Tracks: ${context.completedTrackIds.length > 0 ? context.completedTrackIds.join(', ') : 'None'}
Current Level: ${context.currentLevel}

Available Educational Tracks:
${tracksList}

Based on this user's financial situation and learning progress, recommend the most relevant educational tracks.
Return as a JSON array.`;
  }

  /**
   * Build a summary of user's financial situation
   */
  private buildSituationSummary(context: UserFinancialContext): string {
    const parts: string[] = [];

    if (context.fisScore) {
      parts.push(
        `Financial Independence Score: ${context.fisScore.overallScore}/100`
      );
      parts.push(`Savings Rate: ${context.fisScore.savingsRate}%`);
      parts.push(`Investment Rate: ${context.fisScore.investmentRate}%`);
    }

    parts.push(`Has Debt: ${context.hasDebt ? 'Yes' : 'No'}`);
    parts.push(`Has Savings: ${context.hasSavings ? 'Yes' : 'No'}`);

    if (context.monthlyIncome && context.monthlyExpenses) {
      const savingsAmount = context.monthlyIncome - context.monthlyExpenses;
      parts.push(
        `Monthly Cash Flow: ${savingsAmount >= 0 ? '+' : ''}${savingsAmount}`
      );
    }

    return parts.join('\n');
  }

  /**
   * Parse AI recommendations from GPT-4 response
   */
  private parseRecommendations(
    content: string,
    tracks: EducationalTrack[]
  ): LearningPathRecommendation[] {
    try {
      // Extract JSON from response (may be wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed
        .map((rec: any) => {
          const track = tracks.find((t) => t.id === rec.trackId);
          if (!track) return null;

          return {
            track,
            relevanceScore: rec.relevanceScore || 0.5,
            reasoning: rec.reasoning || 'Recommended for your learning path',
            priority: rec.priority || 'medium',
          };
        })
        .filter((rec: any): rec is LearningPathRecommendation => rec !== null);
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
      return [];
    }
  }

  /**
   * Fallback recommendations when AI fails
   */
  private fallbackRecommendations(
    context: UserFinancialContext,
    tracks: EducationalTrack[],
    limit: number
  ): LearningPathRecommendation[] {
    const recommendations: LearningPathRecommendation[] = [];

    // Rule-based recommendations
    for (const track of tracks) {
      let relevanceScore = 0.5;
      let reasoning = 'Recommended for your learning journey';
      let priority: 'high' | 'medium' | 'low' = 'medium';

      // Debt management for users with debt
      if (context.hasDebt && track.category === 'debt') {
        relevanceScore = 0.9;
        reasoning = 'Managing debt is crucial for financial health';
        priority = 'high';
      }
      // Investment tracks for users with savings
      else if (
        context.hasSavings &&
        !context.hasDebt &&
        track.category === 'investing'
      ) {
        relevanceScore = 0.85;
        reasoning = 'Growing your savings through investments';
        priority = 'high';
      }
      // Budgeting basics for beginners
      else if (
        context.currentLevel === 1 &&
        track.category === 'budgeting' &&
        track.difficulty === 'beginner'
      ) {
        relevanceScore = 0.95;
        reasoning = 'Essential foundation for financial literacy';
        priority = 'high';
      }
      // Goals for intermediate users
      else if (
        context.currentLevel >= 3 &&
        track.category === 'goals' &&
        track.difficulty === 'intermediate'
      ) {
        relevanceScore = 0.75;
        reasoning = 'Setting goals helps maintain financial progress';
        priority = 'medium';
      }

      // Check prerequisites are met
      if (track.prerequisites && track.prerequisites.length > 0) {
        const prereqsMet = track.prerequisites.every((prereq) =>
          context.completedTrackIds.includes(prereq)
        );
        if (!prereqsMet) {
          continue; // Skip if prerequisites not met
        }
      }

      recommendations.push({
        track,
        relevanceScore,
        reasoning,
        priority,
      });
    }

    // Sort by relevance and return top recommendations
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
}
