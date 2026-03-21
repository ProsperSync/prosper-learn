import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { EducationalTrack, TrackProgress } from '../lib/types';
import { educationalTrackEngine } from '../lib/ai';
import { educationalService } from '../services';
import { useAuth } from '../hooks/useAuth';

interface TrackCardProps {
  track: EducationalTrack;
  progress?: TrackProgress;
  onPress: (track: EducationalTrack) => void;
}

function TrackCard({ track, progress, onPress }: TrackCardProps) {
  const { t } = useTranslation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'basics':
        return '📚';
      case 'budgeting':
        return '💰';
      case 'investing':
        return '📈';
      case 'debt':
        return '💳';
      case 'goals':
        return '🎯';
      case 'advanced':
        return '🚀';
      default:
        return '📖';
    }
  };

  const progressPercent = progress?.percentComplete || 0;
  const isCompleted = progress?.isCompleted || false;
  const isInProgress = progress && !isCompleted && progressPercent > 0;

  return (
    <Pressable style={styles.trackCard} onPress={() => onPress(track)}>
      <View style={styles.trackHeader}>
        <Text style={styles.trackEmoji}>{getCategoryEmoji(track.category)}</Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(track.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{t(`education.difficulty.${track.difficulty}`)}</Text>
        </View>
      </View>

      <Text style={styles.trackTitle}>{track.title}</Text>
      <Text style={styles.trackDescription} numberOfLines={2}>
        {track.description}
      </Text>

      <View style={styles.trackMeta}>
        <Text style={styles.trackMetaText}>⏱️ {track.estimatedHours}h</Text>
        <Text style={styles.trackMetaText}>📝 {track.lessons.length} lessons</Text>
        <Text style={styles.trackMetaText}>⭐ {track.totalXP} XP</Text>
      </View>

      {progress && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓ {t('education.completed')}</Text>
        </View>
      )}

      {isInProgress && (
        <View style={styles.inProgressBadge}>
          <Text style={styles.inProgressText}>{t('education.inProgress')}</Text>
        </View>
      )}

      {track.isOfflineAvailable && (
        <Text style={styles.offlineIndicator}>📥 {t('education.offlineAvailable')}</Text>
      )}
    </Pressable>
  );
}

export function EducationalTrackScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [allTracks, setAllTracks] = useState<EducationalTrack[]>([]);
  const [trackProgress, setTrackProgress] = useState<Map<string, TrackProgress>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { user } = useAuth();
  const userId = user?.id ?? '';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const tracks = educationalTrackEngine.getTracks(selectedCategory || undefined, undefined);
      setAllTracks(tracks);

      const progressData = await educationalService.getAllTrackProgress(userId);
      const progressMap = new Map(progressData.map((p) => [p.trackId, p]));
      setTrackProgress(progressMap);
    } catch (error) {
      console.error('Failed to load educational tracks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleTrackPress = (track: EducationalTrack) => {
    router.push('/track/' + track.id);
  };

  const categories = [
    { key: null, label: t('education.categories.all'), emoji: '📚' },
    { key: 'basics', label: t('education.categories.basics'), emoji: '📖' },
    { key: 'budgeting', label: t('education.categories.budgeting'), emoji: '💰' },
    { key: 'investing', label: t('education.categories.investing'), emoji: '📈' },
    { key: 'debt', label: t('education.categories.debt'), emoji: '💳' },
    { key: 'goals', label: t('education.categories.goals'), emoji: '🎯' },
    { key: 'advanced', label: t('education.categories.advanced'), emoji: '🚀' },
  ];

  const inProgressTracks = allTracks.filter((track) => {
    const progress = trackProgress.get(track.id);
    return progress && !progress.isCompleted && progress.percentComplete > 0;
  });

  const completedTracks = allTracks.filter((track) => {
    const progress = trackProgress.get(track.id);
    return progress?.isCompleted;
  });

  const availableTracks = allTracks.filter((track) => {
    const progress = trackProgress.get(track.id);
    return !progress || (!progress.isCompleted && progress.percentComplete === 0);
  });

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
        <Text style={styles.headerTitle}>{t('education.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {completedTracks.length} / {allTracks.length} {t('education.tracksCompleted')}
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilter}
      >
        {categories.map((category) => (
          <Pressable
            key={category.key || 'all'}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.key && styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* In Progress */}
        {inProgressTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('education.inProgress')}</Text>
            {inProgressTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                progress={trackProgress.get(track.id)}
                onPress={handleTrackPress}
              />
            ))}
          </View>
        )}

        {/* Available */}
        {availableTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('education.available')}</Text>
            {availableTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                progress={trackProgress.get(track.id)}
                onPress={handleTrackPress}
              />
            ))}
          </View>
        )}

        {/* Completed */}
        {completedTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('education.completed')}</Text>
            {completedTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                progress={trackProgress.get(track.id)}
                onPress={handleTrackPress}
              />
            ))}
          </View>
        )}

        {allTracks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('education.noTracks')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  categoryFilter: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  trackCard: {
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
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackEmoji: {
    fontSize: 32,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  trackDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  trackMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  trackMetaText: {
    fontSize: 13,
    color: '#666',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  inProgressBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  inProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  offlineIndicator: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
