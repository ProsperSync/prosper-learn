import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Badge, Streak, UserXP, GamificationStats } from '../lib/types';
import { BadgeDisplay, BadgeDetail } from '../components/gamification/BadgeDisplay';
import { StreakList } from '../components/gamification/StreakWidget';
import { XPProgressBar, XPEventFeed } from '../components/gamification/XPProgressBar';
import { gamificationService } from '../services';
import { useTheme, type ThemeColors } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { openaiClient, isOpenAIConfigured } from '../config/openai';
import { ProgressInsightsService, type ProgressInsight } from '../lib/ai/progressInsights';

type Tab = 'overview' | 'badges' | 'streaks' | 'activity';

export function GamificationScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [xpEvents, setXPEvents] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [insightMessage, setInsightMessage] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const { user } = useAuth();
  const userId = user?.id ?? '';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [badgesData, streaksData, xpData, statsData, eventsData] = await Promise.all([
        gamificationService.getBadges(userId),
        gamificationService.getActiveStreaks(userId),
        gamificationService.getUserXP(userId),
        gamificationService.getStats(userId),
        gamificationService.getXPHistory(userId, 10),
      ]);

      setBadges(badgesData);
      setStreaks(streaksData);
      setUserXP(xpData);
      setStats(statsData);
      setXPEvents(eventsData);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderOverview = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* XP Progress */}
      {userXP && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('gamification.overview.progress')}</Text>
          <XPProgressBar userXP={userXP} />
        </View>
      )}

      {/* Stats Summary */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('gamification.overview.stats')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalBadges}</Text>
              <Text style={styles.statLabel}>{t('gamification.stats.totalBadges')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeStreaks}</Text>
              <Text style={styles.statLabel}>{t('gamification.stats.activeStreaks')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.currentLevel}</Text>
              <Text style={styles.statLabel}>{t('gamification.stats.level')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completedTracks}</Text>
              <Text style={styles.statLabel}>{t('gamification.stats.tracksCompleted')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Badges */}
      {badges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('gamification.overview.recentBadges')}</Text>
            <Pressable onPress={() => setActiveTab('badges')}>
              <Text style={styles.sectionLink}>{t('common.viewAll')}</Text>
            </Pressable>
          </View>
          <BadgeDisplay badges={badges.slice(0, 4)} onBadgePress={setSelectedBadge} layout="grid" />
        </View>
      )}

      {/* Active Streaks */}
      {streaks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('gamification.overview.activeStreaks')}</Text>
            <Pressable onPress={() => setActiveTab('streaks')}>
              <Text style={styles.sectionLink}>{t('common.viewAll')}</Text>
            </Pressable>
          </View>
          <StreakList streaks={streaks.slice(0, 2)} />
        </View>
      )}

      {/* AI Progress Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Insights</Text>
        {!isOpenAIConfigured ? (
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              AI-powered progress insights will be available once the OpenAI integration is configured.
            </Text>
          </View>
        ) : insightMessage ? (
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>{insightMessage}</Text>
          </View>
        ) : (
          <Pressable
            style={styles.insightButton}
            onPress={async () => {
              if (!openaiClient || insightLoading) return;
              setInsightLoading(true);
              try {
                const service = new ProgressInsightsService(openaiClient);
                const msg = await service.generateQuickInsight([], [], 'week', 'en');
                setInsightMessage(msg);
              } catch {
                setInsightMessage('Unable to generate insights right now. Try again later.');
              } finally {
                setInsightLoading(false);
              }
            }}
            disabled={insightLoading}
          >
            {insightLoading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Text style={styles.insightButtonText}>Generate Insights</Text>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );

  const renderBadges = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {stats && (
        <View style={styles.badgeStats}>
          <Text style={styles.badgeStatsTitle}>{t('gamification.badges.byTier')}</Text>
          <View style={styles.tierStats}>
            <View style={styles.tierStat}>
              <Text style={[styles.tierEmoji, { color: '#CD7F32' }]}>🥉</Text>
              <Text style={styles.tierCount}>{stats.badgesByTier.bronze}</Text>
            </View>
            <View style={styles.tierStat}>
              <Text style={[styles.tierEmoji, { color: '#C0C0C0' }]}>🥈</Text>
              <Text style={styles.tierCount}>{stats.badgesByTier.silver}</Text>
            </View>
            <View style={styles.tierStat}>
              <Text style={[styles.tierEmoji, { color: '#FFD700' }]}>🥇</Text>
              <Text style={styles.tierCount}>{stats.badgesByTier.gold}</Text>
            </View>
            <View style={styles.tierStat}>
              <Text style={[styles.tierEmoji, { color: '#E5E4E2' }]}>💎</Text>
              <Text style={styles.tierCount}>{stats.badgesByTier.platinum}</Text>
            </View>
          </View>
        </View>
      )}
      <BadgeDisplay badges={badges} onBadgePress={setSelectedBadge} layout="grid" />
    </ScrollView>
  );

  const renderStreaks = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StreakList streaks={streaks} />
    </ScrollView>
  );

  const renderActivity = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <XPEventFeed events={xpEvents} limit={20} />
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('gamification.title')}</Text>
        {stats && (
          <Text style={styles.headerSubtitle}>
            {t('gamification.xp.level')} {stats.currentLevel} • {stats.totalXP.toLocaleString()} XP
          </Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            {t('gamification.tabs.overview')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
          onPress={() => setActiveTab('badges')}
        >
          <Text style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}>
            {t('gamification.tabs.badges')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'streaks' && styles.tabActive]}
          onPress={() => setActiveTab('streaks')}
        >
          <Text style={[styles.tabText, activeTab === 'streaks' && styles.tabTextActive]}>
            {t('gamification.tabs.streaks')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
            {t('gamification.tabs.activity')}
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'badges' && renderBadges()}
        {activeTab === 'streaks' && renderStreaks()}
        {activeTab === 'activity' && renderActivity()}
      </View>

      {/* Badge Detail Modal */}
      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedBadge(null)}>
          <View style={styles.modalContent}>
            {selectedBadge && (
              <BadgeDetail badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  badgeStats: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeStatsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  tierStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tierStat: {
    alignItems: 'center',
  },
  tierEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tierCount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  insightCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  insightButton: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
  },
  insightButtonText: {
    fontSize: 15,
    color: colors.primary.main,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
  },
});
