import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Badge,
  Streak,
  XPEvent,
  UserXP,
  Reward,
  GamificationStats,
} from '../lib/types';
import { trackBadgeUnlocked } from '../lib/analytics/analyticsService';

/**
 * Gamification Service
 * Manages persistence of gamification data with offline-first AsyncStorage
 */

const STORAGE_KEYS = {
  BADGES: '@gamification/badges',
  STREAKS: '@gamification/streaks',
  XP_EVENTS: '@gamification/xp_events',
  USER_XP: '@gamification/user_xp',
  REWARDS: '@gamification/rewards',
  STATS: '@gamification/stats',
};

export class GamificationService {
  /**
   * Badges
   */
  async saveBadge(badge: Badge): Promise<void> {
    const badges = await this.getBadges(badge.userId);
    const existing = badges.findIndex((b) => b.id === badge.id);

    if (existing >= 0) {
      badges[existing] = badge;
    } else {
      badges.push(badge);
      // Analytics: track new badge unlock
      trackBadgeUnlocked(badge.id, badge.type);
    }

    await AsyncStorage.setItem(`${STORAGE_KEYS.BADGES}:${badge.userId}`, JSON.stringify(badges));
  }

  async getBadges(userId: string): Promise<Badge[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.BADGES}:${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getUserBadges(userId: string, type?: string): Promise<Badge[]> {
    const badges = await this.getBadges(userId);
    return type ? badges.filter((b) => b.type === type) : badges;
  }

  /**
   * Streaks
   */
  async saveStreak(streak: Streak): Promise<void> {
    const streaks = await this.getStreaks(streak.userId);
    const existing = streaks.findIndex((s) => s.id === streak.id);

    if (existing >= 0) {
      streaks[existing] = streak;
    } else {
      streaks.push(streak);
    }

    await AsyncStorage.setItem(`${STORAGE_KEYS.STREAKS}:${streak.userId}`, JSON.stringify(streaks));
  }

  async getStreaks(userId: string): Promise<Streak[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.STREAKS}:${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getActiveStreaks(userId: string): Promise<Streak[]> {
    const streaks = await this.getStreaks(userId);
    return streaks.filter((s) => s.isActive);
  }

  async getStreakByType(userId: string, type: string): Promise<Streak | null> {
    const streaks = await this.getStreaks(userId);
    return streaks.find((s) => s.type === type && s.isActive) || null;
  }

  /**
   * XP Events
   */
  async saveXPEvent(event: XPEvent): Promise<void> {
    const events = await this.getXPEvents(event.userId);
    events.push(event);

    await AsyncStorage.setItem(`${STORAGE_KEYS.XP_EVENTS}:${event.userId}`, JSON.stringify(events));
  }

  async getXPEvents(userId: string): Promise<XPEvent[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.XP_EVENTS}:${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getXPHistory(userId: string, limit = 50): Promise<XPEvent[]> {
    const events = await this.getXPEvents(userId);
    return events
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, limit);
  }

  /**
   * User XP
   */
  async saveUserXP(userXP: UserXP): Promise<void> {
    await AsyncStorage.setItem(`${STORAGE_KEYS.USER_XP}:${userXP.userId}`, JSON.stringify(userXP));
  }

  async getUserXP(userId: string): Promise<UserXP | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_XP}:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Rewards
   */
  async saveReward(reward: Reward): Promise<void> {
    const rewards = await this.getRewards(reward.userId);
    const existing = rewards.findIndex((r) => r.id === reward.id);

    if (existing >= 0) {
      rewards[existing] = reward;
    } else {
      rewards.push(reward);
    }

    await AsyncStorage.setItem(`${STORAGE_KEYS.REWARDS}:${reward.userId}`, JSON.stringify(rewards));
  }

  async getRewards(userId: string): Promise<Reward[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.REWARDS}:${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getUnredeemedRewards(userId: string): Promise<Reward[]> {
    const rewards = await this.getRewards(userId);
    const now = new Date();

    return rewards.filter((r) => {
      if (r.isRedeemed) return false;
      if (r.expiresAt && new Date(r.expiresAt) < now) return false;
      return true;
    });
  }

  async redeemReward(userId: string, rewardId: string): Promise<void> {
    const rewards = await this.getRewards(userId);
    const reward = rewards.find((r) => r.id === rewardId);

    if (reward) {
      reward.isRedeemed = true;
      reward.redeemedAt = new Date().toISOString();
      await AsyncStorage.setItem(`${STORAGE_KEYS.REWARDS}:${userId}`, JSON.stringify(rewards));
    }
  }

  /**
   * Stats
   */
  async calculateStats(userId: string): Promise<GamificationStats> {
    const [badges, streaks, userXP] = await Promise.all([
      this.getBadges(userId),
      this.getStreaks(userId),
      this.getUserXP(userId),
    ]);

    const badgesByTier = {
      bronze: badges.filter((b) => b.tier === 'bronze').length,
      silver: badges.filter((b) => b.tier === 'silver').length,
      gold: badges.filter((b) => b.tier === 'gold').length,
      platinum: badges.filter((b) => b.tier === 'platinum').length,
    };

    const activeStreaks = streaks.filter((s) => s.isActive).length;
    const longestStreak = Math.max(0, ...streaks.map((s) => s.longestStreak));

    const stats: GamificationStats = {
      userId,
      totalBadges: badges.length,
      badgesByTier,
      activeStreaks,
      longestStreak,
      totalXP: userXP?.totalXP || 0,
      currentLevel: userXP?.currentLevel || 1,
      completedTracks: 0, // Calculated by EducationalService
      completedLessons: 0, // Calculated by EducationalService
      quizAverage: 0, // Calculated by EducationalService
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(`${STORAGE_KEYS.STATS}:${userId}`, JSON.stringify(stats));

    return stats;
  }

  async getStats(userId: string): Promise<GamificationStats | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.STATS}:${userId}`);
      if (!data) {
        // Calculate if not cached
        return await this.calculateStats(userId);
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Clear all data (for testing or logout)
   */
  async clearAllData(userId: string): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(`${STORAGE_KEYS.BADGES}:${userId}`),
      AsyncStorage.removeItem(`${STORAGE_KEYS.STREAKS}:${userId}`),
      AsyncStorage.removeItem(`${STORAGE_KEYS.XP_EVENTS}:${userId}`),
      AsyncStorage.removeItem(`${STORAGE_KEYS.USER_XP}:${userId}`),
      AsyncStorage.removeItem(`${STORAGE_KEYS.REWARDS}:${userId}`),
      AsyncStorage.removeItem(`${STORAGE_KEYS.STATS}:${userId}`),
    ]);
  }
}

// Global instance
export const gamificationService = new GamificationService();
