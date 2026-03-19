import { z } from 'zod';

/**
 * Badge Types & Schemas
 */

export const BadgeTypeSchema = z.enum([
  // Financial Health
  'first_transaction',
  'week_streak',
  'month_streak',
  'budget_champion',
  'savings_starter',
  'debt_slayer',
  'investment_initiator',

  // FIS Milestones
  'fis_beginner',
  'fis_developing',
  'fis_proficient',
  'fis_expert',

  // Goal Achievements
  'first_goal',
  'goal_achiever',
  'milestone_master',
  'ambitious_planner',

  // Education
  'knowledge_seeker',
  'quiz_master',
  'track_completed',
  'perfect_score',

  // Engagement
  'early_adopter',
  'daily_user',
  'voice_enthusiast',
  'social_sharer',
]);

export type BadgeType = z.infer<typeof BadgeTypeSchema>;

export const BadgeTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum']);
export type BadgeTier = z.infer<typeof BadgeTierSchema>;

export const BadgeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  householdId: z.string().optional(),
  type: BadgeTypeSchema,
  tier: BadgeTierSchema,
  earnedAt: z.string(), // ISO timestamp
  criteria: z.object({
    description: z.string(),
    threshold: z.number().optional(),
    timeframe: z.string().optional(),
  }),
  metadata: z.record(z.string(), z.any()).optional(),
  upgradedFrom: z.string().optional(), // ID of previous tier badge (for tier upgrades)
  illustrationUrl: z.string().optional(), // URL to badge illustration in storage
});

export type Badge = z.infer<typeof BadgeSchema>;

/**
 * Streak Types & Schemas
 */

export const StreakTypeSchema = z.enum([
  'transaction_entry', // Daily transaction logging
  'budget_review', // Weekly budget checks
  'goal_progress', // Monthly goal updates
  'fis_check', // Weekly FIS reviews
  'educational', // Learning streak
]);

export type StreakType = z.infer<typeof StreakTypeSchema>;

export const StreakSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: StreakTypeSchema,
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastActivityDate: z.string(), // ISO date (YYYY-MM-DD)
  startDate: z.string(),
  endDate: z.string().optional(), // If streak is broken
  isActive: z.boolean(),
  milestones: z
    .array(
      z.object({
        days: z.number(),
        reachedAt: z.string().optional(),
      })
    )
    .optional(),
});

export type Streak = z.infer<typeof StreakSchema>;

/**
 * XP (Experience Points) Types & Schemas
 */

export const XPEventTypeSchema = z.enum([
  // Basic Actions
  'transaction_created',
  'transaction_categorized',
  'budget_set',
  'goal_created',

  // Milestones
  'goal_completed',
  'milestone_reached',
  'streak_milestone',
  'fis_improved',

  // Education
  'lesson_completed',
  'quiz_passed',
  'track_completed',
  'perfect_quiz',

  // Engagement
  'daily_login',
  'voice_command_used',
  'feedback_provided',
  'referral_made',
]);

export type XPEventType = z.infer<typeof XPEventTypeSchema>;

export const XPEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: XPEventTypeSchema,
  points: z.number().int().min(0),
  earnedAt: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type XPEvent = z.infer<typeof XPEventSchema>;

export const XPLevelSchema = z.object({
  level: z.number().int().min(1),
  title: z.string(),
  minXP: z.number().int().min(0),
  maxXP: z.number().int(),
  rewards: z
    .array(
      z.object({
        type: z.enum(['badge', 'feature', 'discount']),
        value: z.string(),
      })
    )
    .optional(),
});

export type XPLevel = z.infer<typeof XPLevelSchema>;

export const UserXPSchema = z.object({
  userId: z.string(),
  totalXP: z.number().int().min(0),
  currentLevel: z.number().int().min(1),
  levelProgress: z.number().min(0).max(1), // 0-1 percentage
  nextLevelXP: z.number().int(),
  lifetimeXP: z.number().int().min(0),
  updatedAt: z.string(),
});

export type UserXP = z.infer<typeof UserXPSchema>;

/**
 * Educational Track Types & Schemas
 */

export const LessonTypeSchema = z.enum(['article', 'video', 'interactive', 'quiz', 'challenge']);

export type LessonType = z.infer<typeof LessonTypeSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  order: z.number().int().min(1),
  type: LessonTypeSchema,
  title: z.string(),
  description: z.string(),
  content: z.object({
    body: z.string().optional(),
    videoUrl: z.string().optional(),
    quizQuestions: z
      .array(
        z.object({
          id: z.string(),
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number().int(),
          explanation: z.string().optional(),
        })
      )
      .optional(),
  }),
  duration: z.number().int().optional(), // Minutes
  xpReward: z.number().int().min(0),
  requiredLevel: z.number().int().min(1).optional(),
  prerequisites: z.array(z.string()).optional(), // Lesson IDs
});

export type Lesson = z.infer<typeof LessonSchema>;

export const EducationalTrackSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['basics', 'budgeting', 'investing', 'debt', 'goals', 'advanced']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number(),
  lessons: z.array(z.string()), // Lesson IDs
  totalXP: z.number().int().min(0),
  prerequisites: z.array(z.string()).optional(), // Track IDs
  thumbnail: z.string().optional(),
  isOfflineAvailable: z.boolean().default(true),
});

export type EducationalTrack = z.infer<typeof EducationalTrackSchema>;

export const UserProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  trackId: z.string(),
  lessonId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  quizScore: z.number().min(0).max(100).optional(),
  attempts: z.number().int().min(0).default(0),
  lastAccessedAt: z.string(),
  timeSpent: z.number().int().min(0).default(0), // Seconds
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

export const TrackProgressSchema = z.object({
  userId: z.string(),
  trackId: z.string(),
  completedLessons: z.number().int().min(0),
  totalLessons: z.number().int().min(1),
  percentComplete: z.number().min(0).max(100),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  earnedXP: z.number().int().min(0),
  isCompleted: z.boolean(),
});

export type TrackProgress = z.infer<typeof TrackProgressSchema>;

/**
 * Reward Types & Schemas
 */

export const RewardTypeSchema = z.enum([
  'badge',
  'xp_boost',
  'feature_unlock',
  'discount',
  'custom',
]);

export type RewardType = z.infer<typeof RewardTypeSchema>;

export const RewardSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: RewardTypeSchema,
  title: z.string(),
  description: z.string(),
  value: z.string(), // Badge ID, feature flag, discount code, etc.
  earnedAt: z.string(),
  expiresAt: z.string().optional(),
  isRedeemed: z.boolean().default(false),
  redeemedAt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  costXp: z.number().int().min(0).optional(), // XP cost snapshot at redemption
  redeemableRewardId: z.string().optional(), // Reference to catalog item
  redemptionMetadata: z.record(z.string(), z.any()).optional(), // Additional redemption data
});

export type Reward = z.infer<typeof RewardSchema>;

/**
 * Redeemable Reward Types & Schemas
 */

export const RedeemableRewardTypeSchema = z.enum([
  'premium_feature',
  'theme',
  'household_perk',
  'discount',
]);

export type RedeemableRewardType = z.infer<typeof RedeemableRewardTypeSchema>;

export const RedeemableRewardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: RedeemableRewardTypeSchema,
  costXp: z.number().int().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RedeemableReward = z.infer<typeof RedeemableRewardSchema>;

/**
 * Redemption Types & Schemas
 */

export const RedemptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  redeemableRewardId: z.string(),
  costXp: z.number().int().min(0),
  redemptionMetadata: z.record(z.string(), z.any()).optional(),
  redeemedAt: z.string(),
});

export type Redemption = z.infer<typeof RedemptionSchema>;

/**
 * Badge Upgrade Types & Schemas
 */

export const BadgeUpgradeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  badgeId: z.string(),
  fromBadgeId: z.string().optional(),
  badgeType: BadgeTypeSchema,
  fromTier: BadgeTierSchema,
  toTier: BadgeTierSchema,
  upgradedAt: z.string(),
  eligibilityCriteria: z.record(z.string(), z.any()).optional(),
  lineageId: z.string().optional(),
});

export type BadgeUpgrade = z.infer<typeof BadgeUpgradeSchema>;

export const BadgeUpgradeEligibilitySchema = z.object({
  isEligible: z.boolean(),
  nextTier: BadgeTierSchema.nullable(),
  daysHeld: z.number().int().min(0),
  daysRequired: z.number().int().min(0),
  currentValue: z.number().optional(),
  thresholdRequired: z.number().optional(),
  timeBasedEligible: z.boolean(),
  thresholdBasedEligible: z.boolean(),
});

export type BadgeUpgradeEligibility = z.infer<typeof BadgeUpgradeEligibilitySchema>;

/**
 * Gamification Statistics
 */

export const GamificationStatsSchema = z.object({
  userId: z.string(),
  totalBadges: z.number().int().min(0),
  badgesByTier: z.object({
    bronze: z.number().int().min(0),
    silver: z.number().int().min(0),
    gold: z.number().int().min(0),
    platinum: z.number().int().min(0),
  }),
  activeStreaks: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  totalXP: z.number().int().min(0),
  currentLevel: z.number().int().min(1),
  completedTracks: z.number().int().min(0),
  completedLessons: z.number().int().min(0),
  quizAverage: z.number().min(0).max(100).optional(),
  rank: z.number().int().min(1).optional(), // In household or global
  updatedAt: z.string(),
});

export type GamificationStats = z.infer<typeof GamificationStatsSchema>;
