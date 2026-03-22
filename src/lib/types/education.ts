import { z } from 'zod';

export const TrackDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const EducationalModuleSchema = z.object({
  id: z.string().uuid(),
  trackId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  isCompleted: z.boolean().default(false),
});

export const EducationalTrackSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  difficulty: TrackDifficultySchema,
  totalModules: z.number().int().min(0),
  completedModules: z.number().int().min(0),
  progressPercentage: z.number().min(0).max(100),
  estimatedDurationHours: z.number().positive(),
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional(),
});

export type TrackDifficulty = z.infer<typeof TrackDifficultySchema>;
export type EducationalModule = z.infer<typeof EducationalModuleSchema>;
export type EducationalTrackSummary = z.infer<typeof EducationalTrackSummarySchema>;

/**
 * A single message in an AI tutor conversation.
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
