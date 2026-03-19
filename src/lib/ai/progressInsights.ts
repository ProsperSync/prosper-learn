import OpenAI from 'openai';
import type { UserProgress } from '../types';

/**
 * Progress Insights Service
 * Generates personalized insights about user's learning progress
 */

export interface ProgressInsight {
  type: 'engagement' | 'performance' | 'milestone' | 'suggestion';
  title: string;
  description: string;
  metric?: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  actionable: boolean;
  suggestion?: string;
  sentiment: 'positive' | 'neutral' | 'needs_improvement';
}

export interface ProgressAnalysis {
  period: 'week' | 'month';
  insights: ProgressInsight[];
  overallTrend: 'improving' | 'stable' | 'declining';
  motivationalMessage: string;
  recommendedActions: string[];
}

export class ProgressInsightsService {
  constructor(private openai: OpenAI) {}

  /**
   * Generate comprehensive progress insights
   */
  async generateInsights(
    currentProgress: UserProgress[],
    previousProgress: UserProgress[],
    period: 'week' | 'month',
    language: string = 'en'
  ): Promise<ProgressAnalysis> {
    const insights: ProgressInsight[] = [];

    // Analyze engagement
    const engagementInsight = this.analyzeEngagement(
      currentProgress,
      previousProgress,
      period
    );
    insights.push(engagementInsight);

    // Analyze performance
    const performanceInsight = this.analyzePerformance(
      currentProgress,
      previousProgress
    );
    insights.push(performanceInsight);

    // Analyze milestones
    const milestoneInsight = this.analyzeMilestones(currentProgress);
    if (milestoneInsight) {
      insights.push(milestoneInsight);
    }

    // Determine overall trend
    const overallTrend = this.determineTrend(insights);

    // Generate AI-powered motivational message
    const motivationalMessage = await this.generateMotivation(
      insights,
      overallTrend,
      language
    );

    // Generate recommended actions
    const recommendedActions = await this.generateRecommendedActions(
      insights,
      language
    );

    return {
      period,
      insights,
      overallTrend,
      motivationalMessage,
      recommendedActions,
    };
  }

  /**
   * Generate a quick insight message
   */
  async generateQuickInsight(
    currentProgress: UserProgress[],
    previousProgress: UserProgress[],
    period: 'week' | 'month',
    language: string = 'en'
  ): Promise<string> {
    const analysis = await this.generateInsights(
      currentProgress,
      previousProgress,
      period,
      language
    );

    // Return the most significant insight
    const topInsight = analysis.insights.find(
      (i) => i.sentiment === 'positive' && i.metric
    );

    if (topInsight && topInsight.metric) {
      const change = topInsight.metric.changePercent;
      if (change > 0) {
        return `You're ${Math.abs(change).toFixed(0)}% more engaged this ${period}! ${analysis.motivationalMessage}`;
      }
    }

    return analysis.motivationalMessage;
  }

  /**
   * Analyze engagement (lessons accessed, time spent)
   */
  private analyzeEngagement(
    current: UserProgress[],
    previous: UserProgress[],
    period: 'week' | 'month'
  ): ProgressInsight {
    const currentEngagement = this.calculateEngagementScore(current);
    const previousEngagement = this.calculateEngagementScore(previous);

    const change = currentEngagement - previousEngagement;
    const changePercent =
      previousEngagement > 0
        ? (change / previousEngagement) * 100
        : currentEngagement > 0
          ? 100
          : 0;

    let sentiment: 'positive' | 'neutral' | 'needs_improvement' = 'neutral';
    let title = '';
    let description = '';

    if (changePercent > 20) {
      sentiment = 'positive';
      title = 'Engagement Surge!';
      description = `Your learning activity has increased significantly this ${period}. You're on fire! 🔥`;
    } else if (changePercent > 0) {
      sentiment = 'positive';
      title = 'Steady Progress';
      description = `You've been more active in your learning this ${period}. Keep it up!`;
    } else if (changePercent < -20) {
      sentiment = 'needs_improvement';
      title = 'Engagement Dip';
      description = `Your learning activity has decreased this ${period}. Let's get back on track!`;
    } else if (changePercent < 0) {
      sentiment = 'needs_improvement';
      title = 'Slight Decrease';
      description = `Your engagement is down slightly this ${period}. Consider setting aside time for learning.`;
    } else {
      title = 'Consistent Engagement';
      description = `You're maintaining steady learning activity. Great consistency!`;
    }

    return {
      type: 'engagement',
      title,
      description,
      metric: {
        current: currentEngagement,
        previous: previousEngagement,
        change,
        changePercent,
      },
      actionable: sentiment === 'needs_improvement',
      suggestion:
        sentiment === 'needs_improvement'
          ? `Try to complete at least one lesson this ${period} to maintain momentum.`
          : undefined,
      sentiment,
    };
  }

  /**
   * Analyze quiz performance
   */
  private analyzePerformance(
    current: UserProgress[],
    previous: UserProgress[]
  ): ProgressInsight {
    const currentAvgScore = this.calculateAverageQuizScore(current);
    const previousAvgScore = this.calculateAverageQuizScore(previous);

    const change = currentAvgScore - previousAvgScore;
    const changePercent =
      previousAvgScore > 0 ? (change / previousAvgScore) * 100 : 0;

    let sentiment: 'positive' | 'neutral' | 'needs_improvement' = 'neutral';
    let title = '';
    let description = '';

    if (currentAvgScore >= 85) {
      sentiment = 'positive';
      title = 'Excellent Performance!';
      description = `You're mastering the material with an average quiz score of ${currentAvgScore.toFixed(0)}%.`;
    } else if (currentAvgScore >= 70) {
      sentiment = 'positive';
      title = 'Good Understanding';
      description = `You're doing well with an average quiz score of ${currentAvgScore.toFixed(0)}%.`;
    } else if (currentAvgScore >= 50) {
      sentiment = 'neutral';
      title = 'Building Knowledge';
      description = `Your average quiz score is ${currentAvgScore.toFixed(0)}%. Keep practicing to improve!`;
    } else {
      sentiment = 'needs_improvement';
      title = 'Room for Growth';
      description = `Your quiz scores show there's room for improvement. Review lesson content before taking quizzes.`;
    }

    return {
      type: 'performance',
      title,
      description,
      metric:
        previous.length > 0
          ? {
              current: currentAvgScore,
              previous: previousAvgScore,
              change,
              changePercent,
            }
          : undefined,
      actionable: sentiment === 'needs_improvement',
      suggestion:
        sentiment === 'needs_improvement'
          ? 'Try reviewing lesson content before attempting quizzes, and take your time with each question.'
          : undefined,
      sentiment,
    };
  }

  /**
   * Analyze milestones achieved
   */
  private analyzeMilestones(current: UserProgress[]): ProgressInsight | null {
    const completedCount = current.filter(
      (p) => p.status === 'completed'
    ).length;

    if (completedCount === 0) {
      return null;
    }

    // Check for milestone achievements
    const milestones = [
      { count: 1, title: 'First Lesson Complete!', emoji: '🎉' },
      { count: 5, title: '5 Lessons Completed!', emoji: '🌟' },
      { count: 10, title: '10 Lessons Milestone!', emoji: '🏆' },
      { count: 25, title: '25 Lessons Achievement!', emoji: '🎖️' },
      { count: 50, title: '50 Lessons Master!', emoji: '👑' },
    ];

    const milestone = milestones.reverse().find((m) => completedCount >= m.count);

    if (milestone) {
      return {
        type: 'milestone',
        title: milestone.title,
        description: `You've completed ${completedCount} lessons! ${milestone.emoji} Your dedication to learning is impressive.`,
        actionable: false,
        sentiment: 'positive',
      };
    }

    return null;
  }

  /**
   * Calculate engagement score based on activity
   */
  private calculateEngagementScore(progress: UserProgress[]): number {
    if (progress.length === 0) return 0;

    const factors = {
      lessonsStarted: progress.filter((p) => p.status !== 'not_started').length,
      lessonsCompleted: progress.filter((p) => p.status === 'completed').length,
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      recentActivity: progress.filter((p) => p.lastAccessedAt).length,
    };

    // Weighted engagement score
    return (
      factors.lessonsStarted * 2 +
      factors.lessonsCompleted * 5 +
      Math.min(factors.totalTimeSpent / 60, 100) +
      factors.recentActivity * 3
    );
  }

  /**
   * Calculate average quiz score
   */
  private calculateAverageQuizScore(progress: UserProgress[]): number {
    const quizScores = progress
      .filter((p) => p.quizScore !== undefined && p.quizScore !== null)
      .map((p) => p.quizScore!);

    if (quizScores.length === 0) return 0;

    return quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
  }

  /**
   * Determine overall trend from insights
   */
  private determineTrend(
    insights: ProgressInsight[]
  ): 'improving' | 'stable' | 'declining' {
    const sentiments = insights.map((i) => i.sentiment);
    const positiveCount = sentiments.filter((s) => s === 'positive').length;
    const negativeCount = sentiments.filter(
      (s) => s === 'needs_improvement'
    ).length;

    if (positiveCount > negativeCount) return 'improving';
    if (negativeCount > positiveCount) return 'declining';
    return 'stable';
  }

  /**
   * Generate AI-powered motivational message
   */
  private async generateMotivation(
    insights: ProgressInsight[],
    trend: 'improving' | 'stable' | 'declining',
    language: string
  ): Promise<string> {
    const insightsSummary = insights
      .map((i) => `- ${i.type}: ${i.title} - ${i.description}`)
      .join('\n');

    const prompt = `Based on these learning progress insights, generate a motivational message (2-3 sentences):

${insightsSummary}

Overall trend: ${trend}

The message should:
1. Be encouraging and positive
2. Acknowledge specific achievements or areas for improvement
3. Motivate continued learning
4. Be personalized to the insights

Respond in ${language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 150,
      });

      return (
        completion.choices[0].message.content ||
        this.getFallbackMotivation(trend)
      );
    } catch (error) {
      console.error('Failed to generate motivational message:', error);
      return this.getFallbackMotivation(trend);
    }
  }

  /**
   * Generate recommended actions
   */
  private async generateRecommendedActions(
    insights: ProgressInsight[],
    language: string
  ): Promise<string[]> {
    const actionableInsights = insights.filter((i) => i.actionable);

    if (actionableInsights.length === 0) {
      return [
        language === 'pt-BR'
          ? 'Continue sua excelente trajetória de aprendizado!'
          : 'Keep up your excellent learning journey!',
      ];
    }

    // Return suggestions from actionable insights
    return actionableInsights
      .filter((i) => i.suggestion)
      .map((i) => i.suggestion!);
  }

  /**
   * Fallback motivational message
   */
  private getFallbackMotivation(
    trend: 'improving' | 'stable' | 'declining'
  ): string {
    if (trend === 'improving') {
      return "You're making great progress! Your dedication to learning is paying off. Keep up the momentum!";
    } else if (trend === 'declining') {
      return "Every learning journey has its ups and downs. Let's refocus and get back on track together!";
    } else {
      return "You're maintaining steady progress. Consistency is key to mastering financial literacy!";
    }
  }
}
