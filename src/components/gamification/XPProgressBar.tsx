import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { UserXP } from '../../lib/types';

interface XPProgressBarProps {
  userXP: UserXP;
  showAnimation?: boolean;
}

export function XPProgressBar({ userXP, showAnimation = true }: XPProgressBarProps) {
  const { t } = useTranslation();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showAnimation) {
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: userXP.levelProgress,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      progressAnim.setValue(userXP.levelProgress);
    }
  }, [userXP.levelProgress, showAnimation, progressAnim, scaleAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const xpNeeded = userXP.nextLevelXP - userXP.totalXP;
  const progressPercentage = Math.round(userXP.levelProgress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{t('gamification.xp.level')}</Text>
          <Animated.Text style={[styles.levelNumber, { transform: [{ scale: scaleAnim }] }]}>
            {userXP.currentLevel}
          </Animated.Text>
        </View>

        <View style={styles.xpInfo}>
          <Text style={styles.xpLabel}>{t('gamification.xp.total')}</Text>
          <Text style={styles.xpValue}>{userXP.totalXP.toLocaleString()} XP</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('gamification.xp.toNextLevel', { xp: xpNeeded.toLocaleString() })}
        </Text>
        <Text style={styles.nextLevelText}>
          {t('gamification.xp.nextLevel', { level: userXP.currentLevel + 1 })}
        </Text>
      </View>
    </View>
  );
}

interface XPEventFeedProps {
  events: Array<{
    id: string;
    type: string;
    points: number;
    earnedAt: string;
  }>;
  limit?: number;
}

export function XPEventFeed({ events, limit = 5 }: XPEventFeedProps) {
  const { t } = useTranslation();

  const displayEvents = events.slice(0, limit);

  if (displayEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('gamification.xp.noRecentEvents')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.feedContainer}>
      <Text style={styles.feedTitle}>{t('gamification.xp.recentActivity')}</Text>
      {displayEvents.map((event) => (
        <View key={event.id} style={styles.eventItem}>
          <View style={styles.eventIcon}>
            <Text style={styles.eventIconText}>⭐</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventType}>{t(`gamification.xp.events.${event.type}`)}</Text>
            <Text style={styles.eventTime}>
              {new Date(event.earnedAt).toLocaleString('default', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text style={styles.eventPoints}>+{event.points} XP</Text>
        </View>
      ))}
    </View>
  );
}

interface LevelUpNotificationProps {
  level: number;
  onDismiss: () => void;
}

export function LevelUpNotification({ level, onDismiss }: LevelUpNotificationProps) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [level, scaleAnim, opacityAnim, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.levelUpContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.levelUpEmoji}>🎉</Text>
      <Text style={styles.levelUpTitle}>{t('gamification.xp.levelUp')}</Text>
      <Text style={styles.levelUpLevel}>
        {t('gamification.xp.level')} {level}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  xpInfo: {
    flex: 1,
  },
  xpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 12,
    minWidth: 40,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  nextLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  feedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIconText: {
    fontSize: 20,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
  },
  eventPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  levelUpContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -125 }, { translateY: -100 }],
    width: 250,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  levelUpEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  levelUpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  levelUpLevel: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
  },
});
