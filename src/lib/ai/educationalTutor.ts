import OpenAI from 'openai';
import type { Lesson, ConversationMessage } from '../types';

/**
 * Educational Tutor Service
 * Provides conversational AI-powered educational tutoring
 */

export interface TutorContext {
  lesson: Lesson;
  userLevel: number;
  language: 'en' | 'pt-BR';
  conversationHistory: ConversationMessage[];
}

export interface TutorResponse {
  answer: string;
  examples?: string[];
  followUpQuestions?: string[];
  comprehensionCheck?: {
    question: string;
    expectedAnswer: string;
  };
  visualAid?: {
    type: 'chart' | 'diagram' | 'formula';
    description: string;
  };
}

export interface ComprehensionLevel {
  score: number; // 0-1
  indicators: {
    asksClarifyingQuestions: boolean;
    providesCorrectAnswers: boolean;
    needsSimplification: boolean;
    readyForAdvanced: boolean;
  };
  recommendation: string;
}

export class EducationalTutorService {
  private maxContextMessages: number = 10;

  constructor(
    private openai: OpenAI,
    private model: string = 'gpt-4-turbo-preview'
  ) {}

  /**
   * Answer a student's question about lesson content
   */
  async answerQuestion(
    question: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    const systemPrompt = this.buildTutorSystemPrompt(context);
    const conversationHistory = this.formatConversationHistory(
      context.conversationHistory
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: question },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const answer =
        completion.choices[0].message.content ||
        'I apologize, but I need more context to answer that question.';

      // Generate follow-up questions
      const followUpQuestions = await this.generateFollowUpQuestions(
        question,
        answer,
        context
      );

      // Generate comprehension check occasionally
      const comprehensionCheck =
        conversationHistory.length > 2 && Math.random() > 0.7
          ? await this.generateComprehensionCheck(context)
          : undefined;

      return {
        answer,
        followUpQuestions,
        comprehensionCheck,
      };
    } catch (error) {
      console.error('Failed to answer question:', error);
      return {
        answer:
          "I'm having trouble processing your question right now. Could you try rephrasing it?",
      };
    }
  }

  /**
   * Provide an explanation of a concept
   */
  async explainConcept(
    concept: string,
    context: TutorContext,
    includeExample: boolean = true
  ): Promise<TutorResponse> {
    const systemPrompt = this.buildTutorSystemPrompt(context);

    const prompt = `Explain the concept of "${concept}" in the context of ${context.lesson.title}.

${includeExample ? 'Include a practical, real-world example.' : ''}

Adjust the explanation to be appropriate for level ${context.userLevel} learners.
${context.language === 'pt-BR' ? 'Respond in Portuguese (Brazil).' : 'Respond in English.'}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const answer =
        completion.choices[0].message.content || 'Unable to explain concept.';

      // Extract examples from the response if any
      const examples = this.extractExamples(answer);

      return {
        answer,
        examples: examples.length > 0 ? examples : undefined,
      };
    } catch (error) {
      console.error('Failed to explain concept:', error);
      return {
        answer:
          'I apologize, but I cannot explain that concept right now. Please try again.',
      };
    }
  }

  /**
   * Adapt explanation based on user's comprehension level
   */
  async adaptExplanation(
    topic: string,
    comprehensionLevel: number, // 0-1
    context: TutorContext
  ): Promise<string> {
    let complexityLevel: string;

    if (comprehensionLevel < 0.3) {
      complexityLevel = 'very simple, using everyday language and basic analogies';
    } else if (comprehensionLevel < 0.6) {
      complexityLevel = 'moderate, introducing some financial terminology';
    } else if (comprehensionLevel < 0.8) {
      complexityLevel = 'intermediate, using standard financial concepts';
    } else {
      complexityLevel = 'advanced, with technical details and nuances';
    }

    const prompt = `Explain "${topic}" at a ${complexityLevel} level.

Current lesson: ${context.lesson.title}
User's comprehension level: ${(comprehensionLevel * 100).toFixed(0)}%

Make the explanation:
1. Clear and appropriate for their understanding level
2. Engaging and relatable
3. Progressive (building on what they know)

${context.language === 'pt-BR' ? 'Respond in Portuguese (Brazil).' : 'Respond in English.'}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.buildTutorSystemPrompt(context),
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      return (
        completion.choices[0].message.content ||
        'Unable to adapt explanation.'
      );
    } catch (error) {
      console.error('Failed to adapt explanation:', error);
      throw error;
    }
  }

  /**
   * Assess user's comprehension from conversation
   */
  async assessComprehension(
    context: TutorContext
  ): Promise<ComprehensionLevel> {
    if (context.conversationHistory.length < 3) {
      return {
        score: 0.5,
        indicators: {
          asksClarifyingQuestions: false,
          providesCorrectAnswers: false,
          needsSimplification: false,
          readyForAdvanced: false,
        },
        recommendation: 'Continue learning to assess comprehension better.',
      };
    }

    const conversationSummary = context.conversationHistory
      .slice(-10)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `Analyze this learning conversation and assess the student's comprehension:

${conversationSummary}

Lesson: ${context.lesson.title}

Assess:
1. Comprehension score (0-100)
2. Do they ask clarifying questions? (yes/no)
3. Do they provide correct answers when asked? (yes/no)
4. Do they need simpler explanations? (yes/no)
5. Are they ready for advanced content? (yes/no)
6. Recommendation for next steps

Return as JSON:
{
  "score": 75,
  "asksClarifyingQuestions": true,
  "providesCorrectAnswers": true,
  "needsSimplification": false,
  "readyForAdvanced": false,
  "recommendation": "..."
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        score: parsed.score / 100,
        indicators: {
          asksClarifyingQuestions: parsed.asksClarifyingQuestions || false,
          providesCorrectAnswers: parsed.providesCorrectAnswers || false,
          needsSimplification: parsed.needsSimplification || false,
          readyForAdvanced: parsed.readyForAdvanced || false,
        },
        recommendation: parsed.recommendation || 'Continue learning.',
      };
    } catch (error) {
      console.error('Failed to assess comprehension:', error);
      return {
        score: 0.5,
        indicators: {
          asksClarifyingQuestions: false,
          providesCorrectAnswers: false,
          needsSimplification: false,
          readyForAdvanced: false,
        },
        recommendation: 'Continue learning to assess comprehension better.',
      };
    }
  }

  /**
   * Generate a quiz question conversationally
   */
  async askQuizQuestion(context: TutorContext): Promise<TutorResponse> {
    const prompt = `Based on the lesson "${context.lesson.title}", ask the student a quiz question conversationally.

Make it:
1. Relevant to the lesson content
2. Appropriate for level ${context.userLevel}
3. Engaging and thought-provoking
4. Clear what type of answer you expect

${context.language === 'pt-BR' ? 'Ask in Portuguese (Brazil).' : 'Ask in English.'}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.buildTutorSystemPrompt(context),
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
      });

      return {
        answer:
          completion.choices[0].message.content ||
          'Let me ask you a question about what we just learned...',
      };
    } catch (error) {
      console.error('Failed to generate quiz question:', error);
      return {
        answer: 'Can you summarize what you learned from this lesson?',
      };
    }
  }

  /**
   * Build system prompt for the tutor
   */
  private buildTutorSystemPrompt(context: TutorContext): string {
    const languageInstr =
      context.language === 'pt-BR'
        ? 'Always respond in Portuguese (Brazil).'
        : 'Always respond in English.';

    return `You are an expert financial education tutor with a friendly, encouraging teaching style.

${languageInstr}

Current lesson: ${context.lesson.title}
Lesson description: ${context.lesson.description}
${context.lesson.content.body ? `Lesson content: ${context.lesson.content.body.substring(0, 500)}...` : ''}

Student level: ${context.userLevel} (1=beginner, 5=advanced)

Your role:
1. Answer questions clearly and accurately
2. Provide relevant, practical examples
3. Break down complex concepts into digestible parts
4. Adapt explanations to the student's level
5. Check comprehension with follow-up questions
6. Be encouraging and supportive
7. Use analogies and real-world scenarios
8. Guide students to discover answers themselves when appropriate

Teaching principles:
- Clarity over complexity
- Encourage critical thinking
- Build confidence through positive reinforcement
- Connect concepts to real-life situations
- Make learning engaging and interactive`;
  }

  /**
   * Format conversation history for API
   */
  private formatConversationHistory(
    messages: ConversationMessage[]
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages
      .slice(-this.maxContextMessages)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  /**
   * Generate follow-up questions
   */
  private async generateFollowUpQuestions(
    originalQuestion: string,
    answer: string,
    context: TutorContext
  ): Promise<string[]> {
    const prompt = `Based on this Q&A, suggest 2-3 relevant follow-up questions:

Q: ${originalQuestion}
A: ${answer}

Generate questions that:
1. Deepen understanding
2. Connect to related concepts
3. Encourage exploration

${context.language === 'pt-BR' ? 'Questions in Portuguese (Brazil).' : 'Questions in English.'}

Return as JSON array: ["Question 1", "Question 2", "Question 3"]`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 200,
      });

      const content = completion.choices[0].message.content;
      if (!content) return [];

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
      return [];
    }
  }

  /**
   * Generate a comprehension check question
   */
  private async generateComprehensionCheck(
    context: TutorContext
  ): Promise<{ question: string; expectedAnswer: string }> {
    const prompt = `Generate a quick comprehension check question for the lesson "${context.lesson.title}".

Make it:
1. Simple and quick to answer
2. Tests key understanding
3. Not too difficult

${context.language === 'pt-BR' ? 'In Portuguese (Brazil).' : 'In English.'}

Return as JSON:
{
  "question": "...",
  "expectedAnswer": "..."
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to generate comprehension check:', error);
      return {
        question: 'Can you explain one key concept from this lesson?',
        expectedAnswer: 'Any relevant concept from the lesson',
      };
    }
  }

  /**
   * Extract examples from explanation text
   */
  private extractExamples(text: string): string[] {
    const examples: string[] = [];

    // Look for common example patterns
    const patterns = [
      /[Ff]or example[,:]\s*([^.!?]+[.!?])/g,
      /[Ee]xample[:\s]+([^.!?]+[.!?])/g,
      /[Ll]et's say\s+([^.!?]+[.!?])/g,
      /[Ii]magine\s+([^.!?]+[.!?])/g,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          examples.push(match[1].trim());
        }
      }
    }

    return examples.slice(0, 3); // Return up to 3 examples
  }
}
