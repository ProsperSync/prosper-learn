import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Badge, BadgeTier } from '../../lib/types';
import { shareAchievement } from '../../lib/sharing/sharingService';

interface BadgeDisplayProps {
  badges: Badge[];
  onBadgePress?: (badge: Badge) => void;
  layout?: 'grid' | 'list';
}

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

const TIER_ICONS: Record<BadgeTier, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

export function BadgeDisplay({ badges, onBadgePress, layout = 'grid' }: BadgeDisplayProps) {
  const { t } = useTranslation();

  if (badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('gamification.badges.empty')}</Text>
        <Text style={styles.emptySubtext}>{t('gamification.badges.emptyHint')}</Text>
      </View>
    );
  }

  const renderBadge = (badge: Badge) => (
    <Pressable
      key={badge.id}
      style={[
        layout === 'grid' ? styles.badgeCardGrid : styles.badgeCardList,
        { borderColor: TIER_COLORS[badge.tier] },
      ]}
      onPress={() => onBadgePress?.(badge)}
    >
      <View style={[styles.badgeIcon, { backgroundColor: TIER_COLORS[badge.tier] }]}>
        <Text style={styles.badgeEmoji}>{TIER_ICONS[badge.tier]}</Text>
      </View>
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName} numberOfLines={layout === 'grid' ? 2 : 1}>
          {t(`badges.${badge.type}.title`)}
        </Text>
        <Text style={styles.badgeTier}>{t(`gamification.tier.${badge.tier}`)}</Text>
        {layout === 'list' && (
          <Text style={styles.badgeDate}>{new Date(badge.earnedAt).toLocaleDateString()}</Text>
        )}
      </View>
    </Pressable>
  );

  if (layout === 'grid') {
    return (
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {badges.map(renderBadge)}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>{badges.map(renderBadge)}</ScrollView>
  );
}

interface BadgeDetailProps {
  badge: Badge;
  onClose: () => void;
}

export function BadgeDetail({ badge, onClose }: BadgeDetailProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.detailContainer}>
      <View style={[styles.detailBadgeIcon, { backgroundColor: TIER_COLORS[badge.tier] }]}>
        <Text style={styles.detailBadgeEmoji}>{TIER_ICONS[badge.tier]}</Text>
      </View>

      <Text style={styles.detailBadgeName}>{t(`badges.${badge.type}.title`)}</Text>
      <Text style={styles.detailBadgeTier}>{t(`gamification.tier.${badge.tier}`)}</Text>

      <Text style={styles.detailDescription}>{t(`badges.${badge.type}.description`)}</Text>

      <View style={styles.detailCriteria}>
        <Text style={styles.detailCriteriaTitle}>{t('gamification.badges.criteria')}</Text>
        <Text style={styles.detailCriteriaText}>{badge.criteria.description}</Text>
        {badge.criteria.threshold && (
          <Text style={styles.detailCriteriaThreshold}>
            {t('gamification.badges.threshold')}: {badge.criteria.threshold}
          </Text>
        )}
      </View>

      <View style={styles.detailEarned}>
        <Text style={styles.detailEarnedLabel}>{t('gamification.badges.earnedOn')}</Text>
        <Text style={styles.detailEarnedDate}>
          {new Date(badge.earnedAt).toLocaleDateString('default', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.detailActions}>
        <Pressable
          style={styles.shareButton}
          onPress={() => {
            const title = t(`badges.${badge.type}.title`);
            shareAchievement(title);
          }}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </Pressable>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>{t('common.close')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 12,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  badgeCardGrid: {
    width: '45%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeCardList: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  badgeTier: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  badgeDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  detailContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  detailBadgeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailBadgeEmoji: {
    fontSize: 56,
  },
  detailBadgeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailBadgeTier: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailCriteria: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailCriteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailCriteriaText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailCriteriaThreshold: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  detailEarned: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
    marginBottom: 24,
  },
  detailEarnedLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailEarnedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
