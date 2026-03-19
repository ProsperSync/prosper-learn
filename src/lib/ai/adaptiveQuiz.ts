import OpenAI from 'openai';

/**
 * Adaptive Quiz Service
 * Dynamically adjusts quiz difficulty based on user performance
 */

export interface QuizPerformance {
  lessonId: string;
  attempts: number;
  scores: number[]; // Historical scores (0-100)
  averageScore: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DifficultyAdjustment {
  previousDifficulty: 'easy' | 'medium' | 'hard';
  newDifficulty: 'easy' | 'medium' | 'hard';
  reasoning: string;
  adjusted: boolean;
}

export class AdaptiveQuizService {
  constructor(
    private openai: OpenAI,
    private model: string = 'gpt-4-turbo-preview'
  ) {}

  /**
   * Calculate the next difficulty level based on user performance
   */
  calculateNextDifficulty(
    performance: QuizPerformance
  ): DifficultyAdjustment {
    const previousDifficulty = performance.currentDifficulty;

    // Need at least 2 attempts to adjust
    if (performance.attempts < 2) {
      return {
        previousDifficulty,
        newDifficulty: previousDifficulty,
        reasoning: 'Insufficient attempts to adjust difficulty',
        adjusted: false,
      };
    }

    // Analyze recent performance (last 3 attempts)
    const recentScores = performance.scores.slice(-3);
    const avgRecent =
      recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

    let newDifficulty = previousDifficulty;
    let reasoning = '';

    // Increase difficulty if performing well
    if (avgRecent >= 85) {
      if (previousDifficulty === 'easy') {
        newDifficulty = 'medium';
        reasoning = 'Consistently scoring above 85%. Ready for medium difficulty.';
      } else if (previousDifficulty === 'medium') {
        newDifficulty = 'hard';
        reasoning = 'Mastering medium level. Moving to hard difficulty.';
      } else {
        reasoning = 'Already at highest difficulty. Excellent performance!';
      }
    }
    // Decrease difficulty if struggling
    else if (avgRecent < 50) {
      if (previousDifficulty === 'hard') {
        newDifficulty = 'medium';
        reasoning = 'Scoring below 50%. Reducing to medium difficulty.';
      } else if (previousDifficulty === 'medium') {
        newDifficulty = 'easy';
        reasoning = 'Need more practice. Reducing to easy difficulty.';
      } else {
        reasoning = 'Already at lowest difficulty. Keep practicing!';
      }
    }
    // Maintain current difficulty
    else {
      reasoning = `Performance is steady at ${avgRecent.toFixed(1)}%. Maintaining current difficulty.`;
    }

    return {
      previousDifficulty,
      newDifficulty,
      reasoning,
      adjusted: newDifficulty !== previousDifficulty,
    };
  }

  /**
   * Generate adaptive quiz questions using AI
   */
  async generateQuestions(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5,
    language: string = 'en'
  ): Promise<AdaptiveQuestion[]> {
    const prompt = this.buildQuestionGenerationPrompt(
      topic,
      difficulty,
      count,
      language
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(language),
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      return this.parseGeneratedQuestions(content, difficulty);
    } catch (error) {
      console.error('Failed to generate quiz questions:', error);
      throw error;
    }
  }

  /**
   * Provide feedback on quiz performance
   */
  async generatePerformanceFeedback(
    performance: QuizPerformance,
    language: string = 'en'
  ): Promise<string> {
    const difficultyAdjustment = this.calculateNextDifficulty(performance);

    const prompt = `User quiz performance summary:
- Lesson: ${performance.lessonId}
- Attempts: ${performance.attempts}
- Recent scores: ${performance.scores.slice(-3).join(', ')}
- Average score: ${performance.averageScore.toFixed(1)}%
- Current difficulty: ${performance.currentDifficulty}
- Next difficulty: ${difficultyAdjustment.newDifficulty}

Generate encouraging feedback (2-3 sentences) that:
1. Acknowledges their progress
2. Explains the difficulty adjustment (if any)
3. Provides motivation to continue learning

Respond in ${language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 200,
      });

      return (
        completion.choices[0].message.content ||
        'Great work! Keep up the learning momentum.'
      );
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      return this.generateFallbackFeedback(performance, difficultyAdjustment);
    }
  }

  /**
   * Build system prompt for question generation
   */
  private buildSystemPrompt(language: string): string {
    const lang = language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English';

    return `You are an expert at creating financial literacy quiz questions.
Generate educational quiz questions that test understanding of financial concepts.

Respond in ${lang}.

Guidelines:
1. Questions should be clear and unambiguous
2. Provide 4 answer options (A, B, C, D)
3. Include explanations for correct answers
4. Adjust complexity based on difficulty level:
   - Easy: Basic definitions and concepts
   - Medium: Application of concepts to scenarios
   - Hard: Complex analysis and decision-making

Return as a JSON array with this structure:
[
  {
    "question": "What is compound interest?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2,
    "explanation": "Why this is correct..."
  }
]`;
  }

  /**
   * Build question generation prompt
   */
  private buildQuestionGenerationPrompt(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number,
    language: string
  ): string {
    return `Generate ${count} quiz questions about: ${topic}

Difficulty level: ${difficulty}
Language: ${language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}

Difficulty guidelines:
- Easy: Test basic understanding and definitions
- Medium: Test application of concepts with simple scenarios
- Hard: Test complex analysis, trade-offs, and advanced scenarios

Return as a JSON array of questions.`;
  }

  /**
   * Parse generated questions from AI response
   */
  private parseGeneratedQuestions(
    content: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): AdaptiveQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed.map((q: any, index: number) => ({
        id: `adaptive-q-${Date.now()}-${index}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || '',
        difficulty,
      }));
    } catch (error) {
      console.error('Failed to parse generated questions:', error);
      throw new Error('Failed to parse AI-generated questions');
    }
  }

  /**
   * Generate fallback feedback when AI fails
   */
  private generateFallbackFeedback(
    performance: QuizPerformance,
    adjustment: DifficultyAdjustment
  ): string {
    if (performance.averageScore >= 85) {
      return adjustment.adjusted
        ? `Excellent work! You're mastering this content. We've increased the difficulty to ${adjustment.newDifficulty} level to challenge you further.`
        : `Outstanding performance! You're scoring consistently high. Keep up the great work!`;
    } else if (performance.averageScore >= 70) {
      return `Good progress! You're building a solid understanding. ${adjustment.reasoning}`;
    } else if (performance.averageScore >= 50) {
      return adjustment.adjusted
        ? `You're making progress. We've adjusted to ${adjustment.newDifficulty} level to help you build confidence. Keep practicing!`
        : `Keep going! Practice makes perfect. Review the lesson content if needed.`;
    } else {
      return `Don't give up! Learning takes time. We've adjusted to ${adjustment.newDifficulty} level. Take your time to understand each concept.`;
    }
  }
}
