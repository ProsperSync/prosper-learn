import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Streak } from '../../lib/types';

interface StreakWidgetProps {
  streak: Streak;
  showDetails?: boolean;
}

export function StreakWidget({ streak, showDetails = false }: StreakWidgetProps) {
  const { t } = useTranslation();

  const getStreakIcon = (days: number): string => {
    if (days === 0) return '🔥'; // No streak
    if (days < 7) return '🔥'; // Week streak
    if (days < 30) return '🔥🔥'; // Month streak
    if (days < 100) return '🔥🔥🔥'; // Quarter streak
    return '🔥🔥🔥🔥'; // Year streak
  };

  const isAtRisk = (): boolean => {
    if (!streak.isActive) return false;
    const lastActivity = new Date(streak.lastActivityDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff === 1; // Last activity was yesterday
  };

  const getNextMilestone = (): { days: number; reachedAt?: string } | undefined => {
    if (!streak.milestones) return undefined;
    return streak.milestones.find((m) => !m.reachedAt && m.days > streak.currentStreak);
  };

  const nextMilestone = getNextMilestone();
  const atRisk = isAtRisk();

  return (
    <View style={[styles.container, atRisk && styles.containerAtRisk]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getStreakIcon(streak.currentStreak)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{t(`gamification.streak.${streak.type}`)}</Text>
          <View style={styles.countRow}>
            <Text style={styles.count}>{streak.currentStreak}</Text>
            <Text style={styles.countLabel}>
              {t('gamification.streak.days', { count: streak.currentStreak })}
            </Text>
          </View>
        </View>
      </View>

      {atRisk && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ {t('gamification.streak.atRisk')}</Text>
        </View>
      )}

      {showDetails && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('gamification.streak.longest')}</Text>
            <Text style={styles.detailValue}>
              {streak.longestStreak}{' '}
              {t('gamification.streak.days', { count: streak.longestStreak })}
            </Text>
          </View>

          {nextMilestone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('gamification.streak.nextMilestone')}</Text>
              <Text style={styles.detailValue}>
                {nextMilestone.days} {t('gamification.streak.days', { count: nextMilestone.days })}
              </Text>
            </View>
          )}

          {streak.milestones && streak.milestones.length > 0 && (
            <View style={styles.milestones}>
              <Text style={styles.milestonesTitle}>{t('gamification.streak.milestones')}</Text>
              <View style={styles.milestonesRow}>
                {streak.milestones.map((milestone) => (
                  <View
                    key={milestone.days}
                    style={[styles.milestone, milestone.reachedAt && styles.milestoneReached]}
                  >
                    <Text
                      style={[
                        styles.milestoneText,
                        milestone.reachedAt && styles.milestoneTextReached,
                      ]}
                    >
                      {milestone.days}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface StreakListProps {
  streaks: Streak[];
}

export function StreakList({ streaks }: StreakListProps) {
  const { t } = useTranslation();

  if (streaks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('gamification.streak.empty')}</Text>
        <Text style={styles.emptySubtext}>{t('gamification.streak.emptyHint')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {streaks.map((streak) => (
        <StreakWidget key={streak.id} streak={streak} showDetails={true} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerAtRisk: {
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  count: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6F00',
    marginRight: 8,
  },
  countLabel: {
    fontSize: 16,
    color: '#666',
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  details: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  milestones: {
    marginTop: 12,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  milestonesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  milestone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  milestoneReached: {
    borderColor: '#FF6F00',
    backgroundColor: '#FFF3E0',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  milestoneTextReached: {
    color: '#FF6F00',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
});
