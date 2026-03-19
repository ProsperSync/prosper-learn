import type {
  Badge,
  BadgeType,
  BadgeTier,
  GamificationStats,
  Streak,
  UserXP,
  RedeemableReward,
  Redemption,
  Reward,
  BadgeUpgrade,
  BadgeUpgradeEligibility,
} from '../types';

/**
 * Badge Engine
 * Awards badges based on user achievements and milestones
 */

interface BadgeCriteria {
  type: BadgeType;
  tier: BadgeTier;
  condition: (stats: GamificationStats) => boolean;
  titleKey: string;
  descriptionKey: string;
}

const BADGE_DEFINITIONS: BadgeCriteria[] = [
  // First Steps
  {
    type: 'first_transaction',
    tier: 'bronze',
    condition: () => true, // Awarded on first transaction
    titleKey: 'badges.first_transaction.title',
    descriptionKey: 'badges.first_transaction.description',
  },
  {
    type: 'first_goal',
    tier: 'bronze',
    condition: () => true, // Awarded on first goal
    titleKey: 'badges.first_goal.title',
    descriptionKey: 'badges.first_goal.description',
  },

  // Streaks
  {
    type: 'week_streak',
    tier: 'bronze',
    condition: (stats) => stats.longestStreak >= 7,
    titleKey: 'badges.week_streak.title',
    descriptionKey: 'badges.week_streak.description',
  },
  {
    type: 'month_streak',
    tier: 'silver',
    condition: (stats) => stats.longestStreak >= 30,
    titleKey: 'badges.month_streak.title',
    descriptionKey: 'badges.month_streak.description',
  },

  // FIS Levels
  {
    type: 'fis_beginner',
    tier: 'bronze',
    condition: () => true, // Awarded when FIS first calculated
    titleKey: 'badges.fis_beginner.title',
    descriptionKey: 'badges.fis_beginner.description',
  },
  {
    type: 'fis_developing',
    tier: 'silver',
    condition: () => true, // Awarded at FIS 40-59
    titleKey: 'badges.fis_developing.title',
    descriptionKey: 'badges.fis_developing.description',
  },
  {
    type: 'fis_proficient',
    tier: 'gold',
    condition: () => true, // Awarded at FIS 60-79
    titleKey: 'badges.fis_proficient.title',
    descriptionKey: 'badges.fis_proficient.description',
  },
  {
    type: 'fis_expert',
    tier: 'platinum',
    condition: () => true, // Awarded at FIS 80+
    titleKey: 'badges.fis_expert.title',
    descriptionKey: 'badges.fis_expert.description',
  },

  // Goals
  {
    type: 'goal_achiever',
    tier: 'silver',
    condition: () => true, // Awarded on goal completion
    titleKey: 'badges.goal_achiever.title',
    descriptionKey: 'badges.goal_achiever.description',
  },
  {
    type: 'milestone_master',
    tier: 'gold',
    condition: () => true, // Awarded on 5 milestones
    titleKey: 'badges.milestone_master.title',
    descriptionKey: 'badges.milestone_master.description',
  },

  // Education
  {
    type: 'knowledge_seeker',
    tier: 'bronze',
    condition: (stats) => stats.completedLessons >= 1,
    titleKey: 'badges.knowledge_seeker.title',
    descriptionKey: 'badges.knowledge_seeker.description',
  },
  {
    type: 'track_completed',
    tier: 'gold',
    condition: (stats) => stats.completedTracks >= 1,
    titleKey: 'badges.track_completed.title',
    descriptionKey: 'badges.track_completed.description',
  },
  {
    type: 'quiz_master',
    tier: 'silver',
    condition: (stats) => (stats.quizAverage || 0) >= 90,
    titleKey: 'badges.quiz_master.title',
    descriptionKey: 'badges.quiz_master.description',
  },
];

export class BadgeEngine {
  /**
   * Check if user qualifies for any new badges
   */
  checkEligibility(_userId: string, stats: GamificationStats, earnedBadges: Badge[]): BadgeType[] {
    const earnedTypes = new Set(earnedBadges.map((b) => b.type));
    const eligible: BadgeType[] = [];

    for (const criteria of BADGE_DEFINITIONS) {
      if (!earnedTypes.has(criteria.type) && criteria.condition(stats)) {
        eligible.push(criteria.type);
      }
    }

    return eligible;
  }

  /**
   * Award a badge to a user
   */
  awardBadge(userId: string, householdId: string | undefined, type: BadgeType): Badge {
    const criteria = BADGE_DEFINITIONS.find((c) => c.type === type);
    if (!criteria) {
      throw new Error(`Unknown badge type: ${type}`);
    }

    return {
      id: crypto.randomUUID(),
      userId,
      householdId,
      type,
      tier: criteria.tier,
      earnedAt: new Date().toISOString(),
      criteria: {
        description: criteria.descriptionKey,
        threshold: undefined,
        timeframe: undefined,
      },
    };
  }

  /**
   * Get badge metadata for display
   */
  getBadgeMetadata(type: BadgeType): { titleKey: string; descriptionKey: string; tier: BadgeTier } {
    const criteria = BADGE_DEFINITIONS.find((c) => c.type === type);
    if (!criteria) {
      throw new Error(`Unknown badge type: ${type}`);
    }

    return {
      titleKey: criteria.titleKey,
      descriptionKey: criteria.descriptionKey,
      tier: criteria.tier,
    };
  }

  /**
   * Get all available badges
   */
  getAllBadges(): BadgeCriteria[] {
    return BADGE_DEFINITIONS;
  }

  /**
   * Check if a badge is eligible for upgrade
   * @param badge - The badge to check for upgrade eligibility
   * @param stats - User's current gamification statistics
   * @returns Badge upgrade eligibility details including time and threshold requirements
   */
  checkUpgradeEligibility(badge: Badge, stats: GamificationStats): BadgeUpgradeEligibility {
    const now = new Date();
    const earnedDate = new Date(badge.earnedAt);
    const daysHeld = Math.floor((now.getTime() - earnedDate.getTime()) / (1000 * 60 * 60 * 24));

    const nextTier = this.getNextTier(badge.tier);
    if (!nextTier) {
      return {
        isEligible: false,
        nextTier: null,
        daysHeld,
        daysRequired: 0,
        timeBasedEligible: false,
        thresholdBasedEligible: false,
      };
    }

    const daysRequired = this.getTimeDaysForTier(nextTier);
    const timeBasedEligible = daysHeld >= daysRequired;

    // Get threshold from badge criteria or calculate from stats
    const baseThreshold = badge.criteria.threshold || this.getStatValueForBadgeType(badge.type, stats);
    const currentValue = this.getStatValueForBadgeType(badge.type, stats);
    const thresholdBasedEligible = this.checkThresholdForUpgrade(badge.type, currentValue, nextTier);

    return {
      isEligible: timeBasedEligible && thresholdBasedEligible,
      nextTier,
      daysHeld,
      daysRequired,
      currentValue,
      thresholdRequired: this.getThresholdForTier(nextTier, baseThreshold),
      timeBasedEligible,
      thresholdBasedEligible,
    };
  }

  /**
   * Create an upgraded badge from an original badge
   * @param originalBadge - The original badge being upgraded
   * @param newTier - The new tier for the upgraded badge
   * @returns A new badge object with the upgraded tier and lineage tracking
   */
  createUpgradedBadge(originalBadge: Badge, newTier: BadgeTier): Badge {
    return {
      id: crypto.randomUUID(),
      userId: originalBadge.userId,
      householdId: originalBadge.householdId,
      type: originalBadge.type,
      tier: newTier,
      earnedAt: new Date().toISOString(),
      criteria: originalBadge.criteria,
      metadata: originalBadge.metadata,
      upgradedFrom: originalBadge.id,
      illustrationUrl: originalBadge.illustrationUrl,
    };
  }

  /**
   * Create a badge upgrade record for audit trail
   * @param userId - The user ID
   * @param originalBadge - The original badge that was upgraded
   * @param upgradedBadge - The new upgraded badge
   * @returns A badge upgrade record for database insertion
   */
  createUpgradeRecord(userId: string, originalBadge: Badge, upgradedBadge: Badge): BadgeUpgrade {
    return {
      id: crypto.randomUUID(),
      userId,
      badgeId: upgradedBadge.id,
      fromBadgeId: originalBadge.id,
      badgeType: originalBadge.type,
      fromTier: originalBadge.tier,
      toTier: upgradedBadge.tier,
      upgradedAt: new Date().toISOString(),
      lineageId: originalBadge.id,
      eligibilityCriteria: {
        daysHeld: Math.floor((new Date().getTime() - new Date(originalBadge.earnedAt).getTime()) / (1000 * 60 * 60 * 24)),
      },
    };
  }

  /**
   * Check if current value meets threshold for target tier
   * @param badgeType - The type of badge being checked
   * @param currentValue - The current stat value (e.g., streak count)
   * @param targetTier - The tier being checked for (silver, gold, or platinum)
   * @returns true if the threshold is met, false otherwise
   * @remarks Multipliers: silver=2x, gold=5x, platinum=10x base threshold
   */
  checkThresholdForUpgrade(badgeType: BadgeType, currentValue: number, targetTier: BadgeTier): boolean {
    const criteria = BADGE_DEFINITIONS.find((c) => c.type === badgeType);
    if (!criteria) return false;

    const baseThreshold = this.getBaseThresholdForBadgeType(badgeType);
    const multiplier = this.getMultiplierForTier(targetTier);
    
    return currentValue >= (baseThreshold * multiplier);
  }

  /**
   * Get the next tier in progression
   * @param currentTier - The current badge tier
   * @returns The next tier or null if already at maximum (platinum)
   */
  getNextTier(currentTier: BadgeTier): BadgeTier | null {
    const progression: Record<BadgeTier, BadgeTier | null> = {
      bronze: 'silver',
      silver: 'gold',
      gold: 'platinum',
      platinum: null,
    };
    return progression[currentTier];
  }

  /**
   * Get required days for a target tier
   * @param targetTier - The tier to get days requirement for
   * @returns Number of days required (bronze=0, silver=30, gold=90, platinum=180)
   */
  getTimeDaysForTier(targetTier: BadgeTier): number {
    const tierDays: Record<BadgeTier, number> = {
      bronze: 0,
      silver: 30,
      gold: 90,
      platinum: 180,
    };
    return tierDays[targetTier];
  }

  /**
   * Get stat value for a specific badge type
   */
  private getStatValueForBadgeType(badgeType: BadgeType, stats: GamificationStats): number {
    switch (badgeType) {
      case 'week_streak':
      case 'month_streak':
        return stats.longestStreak;
      case 'knowledge_seeker':
      case 'track_completed':
        return stats.completedLessons;
      case 'quiz_master':
        return stats.quizAverage || 0;
      default:
        return 0;
    }
  }

  /**
   * Get base threshold for badge type
   */
  private getBaseThresholdForBadgeType(badgeType: BadgeType): number {
    const criteria = BADGE_DEFINITIONS.find((c) => c.type === badgeType);
    if (!criteria) return 1;

    // Extract threshold from badge definitions
    switch (badgeType) {
      case 'week_streak':
        return 7;
      case 'month_streak':
        return 30;
      case 'knowledge_seeker':
        return 1;
      case 'quiz_master':
        return 90;
      default:
        return 1;
    }
  }

  /**
   * Get multiplier for target tier
   */
  private getMultiplierForTier(targetTier: BadgeTier): number {
    const multipliers: Record<BadgeTier, number> = {
      bronze: 1,
      silver: 2,
      gold: 5,
      platinum: 10,
    };
    return multipliers[targetTier];
  }

  /**
   * Get threshold required for target tier
   */
  private getThresholdForTier(targetTier: BadgeTier, baseThreshold: number): number {
    return baseThreshold * this.getMultiplierForTier(targetTier);
  }
}

/**
 * Streak Tracker
 * Manages user streaks for various activities
 */

export class StreakTracker {
  /**
   * Update streak for an activity
   */
  updateStreak(existingStreak: Streak | null, _activityDate: string): Streak {
    const today = this.getDateString(new Date());
    const yesterday = this.getDateString(this.addDays(new Date(), -1));

    if (!existingStreak) {
      // First activity
      return {
        id: crypto.randomUUID(),
        userId: '', // Set by caller
        type: 'transaction_entry', // Set by caller
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        startDate: today,
        isActive: true,
        milestones: [
          { days: 7, reachedAt: undefined },
          { days: 30, reachedAt: undefined },
          { days: 100, reachedAt: undefined },
        ],
      };
    }

    const lastActivity = existingStreak.lastActivityDate;

    // Same day - no change
    if (lastActivity === today) {
      return existingStreak;
    }

    // Consecutive day - increment
    if (lastActivity === yesterday) {
      const newStreak = existingStreak.currentStreak + 1;
      const updatedMilestones = existingStreak.milestones?.map((m) => ({
        ...m,
        reachedAt: m.reachedAt || (newStreak >= m.days ? today : undefined),
      }));

      return {
        ...existingStreak,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, existingStreak.longestStreak),
        lastActivityDate: today,
        isActive: true,
        milestones: updatedMilestones,
      };
    }

    // Streak broken - reset
    return {
      ...existingStreak,
      currentStreak: 1,
      lastActivityDate: today,
      startDate: today,
      endDate: lastActivity,
      isActive: true,
    };
  }

  /**
   * Check if streak is at risk (last activity was yesterday)
   */
  isAtRisk(streak: Streak): boolean {
    const today = new Date();
    const yesterday = this.getDateString(this.addDays(today, -1));
    return streak.lastActivityDate === yesterday && streak.isActive;
  }

  /**
   * Calculate days until streak expires
   */
  daysUntilExpiry(streak: Streak): number {
    const today = new Date();
    const lastActivity = new Date(streak.lastActivityDate);
    const diff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 1 - diff);
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

/**
 * XP Calculator
 * Calculates and manages experience points
 */

const XP_VALUES = {
  // Basic Actions (5-20 XP)
  transaction_created: 5,
  transaction_categorized: 10,
  budget_set: 15,
  goal_created: 20,

  // Milestones (50-200 XP)
  goal_completed: 100,
  milestone_reached: 50,
  streak_milestone: 75,
  fis_improved: 100,

  // Education (10-100 XP)
  lesson_completed: 25,
  quiz_passed: 50,
  track_completed: 200,
  perfect_quiz: 100,

  // Engagement (5-50 XP)
  daily_login: 5,
  voice_command_used: 10,
  feedback_provided: 15,
  referral_made: 50,
};

const XP_LEVELS = [
  { level: 1, title: 'Novice', minXP: 0, maxXP: 100 },
  { level: 2, title: 'Learner', minXP: 100, maxXP: 250 },
  { level: 3, title: 'Practitioner', minXP: 250, maxXP: 500 },
  { level: 4, title: 'Skilled', minXP: 500, maxXP: 1000 },
  { level: 5, title: 'Expert', minXP: 1000, maxXP: 2000 },
  { level: 6, title: 'Master', minXP: 2000, maxXP: 4000 },
  { level: 7, title: 'Guru', minXP: 4000, maxXP: 8000 },
  { level: 8, title: 'Legend', minXP: 8000, maxXP: 16000 },
  { level: 9, title: 'Sage', minXP: 16000, maxXP: 32000 },
  { level: 10, title: 'Grand Master', minXP: 32000, maxXP: Infinity },
];

export class XPCalculator {
  /**
   * Calculate XP for an event
   */
  calculateXP(eventType: string): number {
    return XP_VALUES[eventType as keyof typeof XP_VALUES] || 0;
  }

  /**
   * Calculate user level from total XP
   */
  calculateLevel(totalXP: number): UserXP {
    let currentLevel = 1;
    let nextLevelXP = XP_LEVELS[1].minXP;

    for (const levelDef of XP_LEVELS) {
      if (totalXP >= levelDef.minXP && totalXP < levelDef.maxXP) {
        currentLevel = levelDef.level;
        const nextLevel = XP_LEVELS[levelDef.level];
        nextLevelXP = nextLevel ? nextLevel.minXP : levelDef.maxXP;
        break;
      }
    }

    const currentLevelDef = XP_LEVELS[currentLevel - 1];
    const xpInLevel = totalXP - currentLevelDef.minXP;
    const xpForLevel = nextLevelXP - currentLevelDef.minXP;
    const levelProgress = Math.min(1, xpInLevel / xpForLevel);

    return {
      userId: '', // Set by caller
      totalXP,
      currentLevel,
      levelProgress,
      nextLevelXP,
      lifetimeXP: totalXP,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get level definition
   */
  getLevelDefinition(level: number) {
    return XP_LEVELS[level - 1] || XP_LEVELS[XP_LEVELS.length - 1];
  }

  /**
   * Get all level definitions
   */
  getAllLevels() {
    return XP_LEVELS;
  }

  /**
   * Calculate XP needed for next level
   */
  xpToNextLevel(totalXP: number): number {
    const userXP = this.calculateLevel(totalXP);
    return userXP.nextLevelXP - totalXP;
  }
}

/**
 * Redemption Engine
 * Manages reward redemptions and validation
 * 
 * @remarks
 * Handles XP-based reward redemption logic including:
 * - Validation of user eligibility (XP balance, one-time restrictions)
 * - Filtering available rewards based on user state
 * - Generating redemption records and discount codes
 */

export class RedemptionEngine {
  /**
   * Validate if a user can redeem a reward
   * @param _userId - User ID (reserved for future use)
   * @param rewardId - The reward ID to validate
   * @param _userXP - User's current XP balance (reserved for future use)
   * @param earnedRewards - List of rewards already earned by the user
   * @returns Validation result with reason for failure if invalid
   * @deprecated Use validateRedemptionWithReward for full validation
   */
  validateRedemption(
    _userId: string,
    rewardId: string,
    _userXP: number,
    earnedRewards: Reward[]
  ): { valid: boolean; reason?: string } {
    // Note: This method validates against earnedRewards for backward compatibility
    // In practice, we should pass the redeemable reward and redemption history
    // For now, we'll check if the rewardId exists in earnedRewards
    
    // Check if already redeemed (one-time reward)
    if (this.isAlreadyRedeemed(_userId, rewardId, earnedRewards)) {
      return { valid: false, reason: 'Reward already redeemed' };
    }

    return { valid: true };
  }

  /**
   * Validate redemption with full reward details
   * @param _userId - User ID (reserved for future use)
   * @param reward - The redeemable reward to validate
   * @param userXP - User's current XP balance
   * @param redemptions - User's redemption history
   * @returns Validation result with specific reason for failure
   * @remarks Checks: reward active, sufficient XP, one-time restriction
   */
  validateRedemptionWithReward(
    _userId: string,
    reward: RedeemableReward,
    userXP: number,
    redemptions: Redemption[]
  ): { valid: boolean; reason?: string } {
    // Check if reward is active
    if (!reward.isActive) {
      return { valid: false, reason: 'Reward is not active' };
    }

    // Check if user has enough XP
    if (userXP < reward.costXp) {
      return { valid: false, reason: 'Insufficient XP' };
    }

    // Check if already redeemed (for one-time rewards)
    const isOneTime = reward.metadata?.one_time_only === true;
    if (isOneTime) {
      const alreadyRedeemed = redemptions.some(r => r.redeemableRewardId === reward.id);
      if (alreadyRedeemed) {
        return { valid: false, reason: 'One-time reward already redeemed' };
      }
    }

    return { valid: true };
  }

  /**
   * Check if user has already redeemed a one-time reward
   * @param _userId - User ID (reserved for future use)
   * @param rewardId - The reward ID to check
   * @param earnedRewards - List of rewards already earned by the user
   * @returns true if reward was already redeemed, false otherwise
   */
  isAlreadyRedeemed(_userId: string, rewardId: string, earnedRewards: Reward[]): boolean {
    return earnedRewards.some(r => r.redeemableRewardId === rewardId);
  }

  /**
   * Get available rewards for a user
   * @param allRewards - Complete catalog of redeemable rewards
   * @param userXP - User's current XP balance
   * @param redeemedRewards - User's redemption history
   * @returns Filtered and sorted list of rewards user can redeem
   * @remarks Filters: active, affordable, not already redeemed (one-time). Sorts by cost ascending.
   */
  getAvailableRewards(
    allRewards: RedeemableReward[],
    userXP: number,
    redeemedRewards: Redemption[]
  ): RedeemableReward[] {
    const redeemedIds = new Set(redeemedRewards.map(r => r.redeemableRewardId));

    return allRewards
      .filter(reward => {
        // Must be active
        if (!reward.isActive) return false;

        // Must be affordable
        if (reward.costXp > userXP) return false;

        // Check if already redeemed (for one-time rewards)
        const isOneTime = reward.metadata?.one_time_only === true;
        if (isOneTime && redeemedIds.has(reward.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.costXp - b.costXp);
  }

  /**
   * Calculate remaining XP after redemption
   * @param currentXP - User's current XP balance
   * @param rewardCost - Cost of the reward being redeemed
   * @returns Remaining XP after deduction
   */
  calculateRemainingXP(currentXP: number, rewardCost: number): number {
    return currentXP - rewardCost;
  }

  /**
   * Create a redemption record
   * @param userId - The user ID
   * @param rewardId - The redeemable reward ID
   * @param costXp - XP cost at time of redemption
   * @param metadata - Optional metadata (discount codes, activation data, etc.)
   * @returns A redemption record ready for database insertion
   */
  createRedemptionRecord(
    userId: string,
    rewardId: string,
    costXp: number,
    metadata?: Record<string, any>
  ): Redemption {
    return {
      id: crypto.randomUUID(),
      userId,
      redeemableRewardId: rewardId,
      costXp,
      redemptionMetadata: metadata,
      redeemedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a unique discount code
   * @param rewardTitle - The title of the reward to generate code for
   * @returns A unique discount code in format PREFIX-XXXX-XXXX
   * @remarks Prefix is first 3 alphanumeric chars from title (uppercase), followed by random alphanumeric
   */
  generateDiscountCode(rewardTitle: string): string {
    // Create prefix from first 3 characters of title (uppercase)
    const prefix = rewardTitle
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');

    // Generate random alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const randomPart2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    return `${prefix}-${randomPart1}-${randomPart2}`;
  }
}

/**
 * Global instances
 */
export const badgeEngine = new BadgeEngine();
export const streakTracker = new StreakTracker();
export const xpCalculator = new XPCalculator();
export const redemptionEngine = new RedemptionEngine();
