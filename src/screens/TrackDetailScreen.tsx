import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { EducationalTrack, Lesson, UserProgress } from '../lib/types';
import { educationalTrackEngine } from '../lib/ai';
import { educationalService } from '../services';
import { useAuth } from '../hooks/useAuth';

interface TrackDetailScreenProps {
  trackId: string;
}

interface LessonCardProps {
  lesson: Lesson;
  progress: UserProgress | null;
  onPress: (lesson: Lesson) => void;
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'article':
      return '#4CAF50';
    case 'quiz':
      return '#FF9800';
    case 'video':
      return '#2196F3';
    case 'interactive':
      return '#9C27B0';
    case 'challenge':
      return '#F44336';
    default:
      return '#999';
  }
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'article':
      return '📖';
    case 'quiz':
      return '📝';
    case 'video':
      return '🎥';
    case 'interactive':
      return '🔧';
    case 'challenge':
      return '🏆';
    default:
      return '📚';
  }
}

function getDifficultyColor(difficulty: string): string {
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
}

function LessonCard({ lesson, progress, onPress }: LessonCardProps) {
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  return (
    <Pressable
      style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}
      onPress={() => onPress(lesson)}
    >
      <View style={styles.lessonCardLeft}>
        <View style={styles.lessonOrder}>
          {isCompleted ? (
            <Text style={styles.lessonOrderCheckmark}>✓</Text>
          ) : (
            <Text style={styles.lessonOrderText}>{lesson.order}</Text>
          )}
        </View>
      </View>

      <View style={styles.lessonCardContent}>
        <View style={styles.lessonCardHeader}>
          <Text style={[styles.lessonTitle, isCompleted && styles.lessonTitleCompleted]}>
            {lesson.title}
          </Text>
          {isInProgress && (
            <View style={styles.inProgressDot} />
          )}
        </View>

        <Text style={styles.lessonDescription} numberOfLines={2}>
          {lesson.description}
        </Text>

        <View style={styles.lessonMeta}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(lesson.type) }]}>
            <Text style={styles.typeBadgeText}>
              {getTypeEmoji(lesson.type)} {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
            </Text>
          </View>

          {lesson.duration != null && (
            <Text style={styles.lessonMetaText}>⏱️ {lesson.duration} min</Text>
          )}

          <Text style={styles.lessonMetaText}>⭐ {lesson.xpReward} XP</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function TrackDetailScreen({ trackId }: TrackDetailScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [track, setTrack] = useState<EducationalTrack | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const trackData = educationalTrackEngine.getTrack(trackId);
      if (!trackData) {
        setError('Track not found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setTrack(trackData);
      const trackLessons = educationalTrackEngine.getTrackLessons(trackId);
      setLessons(trackLessons);

      // Load lesson progress
      if (userId) {
        const progress = await educationalService.getLessonProgress(userId, trackId);
        const progressMap = new Map(progress.map((p) => [p.lessonId, p]));
        setLessonProgress(progressMap);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load track details:', err);
      setError('Failed to load track');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trackId, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleLessonPress = (lesson: Lesson) => {
    router.push('/lesson/' + lesson.id);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Calculate progress stats
  const completedCount = lessons.filter(
    (l) => lessonProgress.get(l.id)?.status === 'completed'
  ).length;
  const totalXPEarned = lessons.reduce((sum, l) => {
    const progress = lessonProgress.get(l.id);
    return progress?.status === 'completed' ? sum + l.xpReward : sum;
  }, 0);
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  // --- RENDER ---

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading track...</Text>
      </View>
    );
  }

  if (error || !track) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Track Not Found</Text>
        <Text style={styles.errorMessage}>
          {error || "We couldn't find this track. It may have been removed or the link is incorrect."}
        </Text>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back Button */}
        <Pressable style={styles.backArrow} onPress={handleGoBack}>
          <Text style={styles.backArrowText}>←</Text>
        </Pressable>

        {/* Track Header */}
        <View style={styles.trackHeader}>
          <View style={styles.trackTitleRow}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(track.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {track.difficulty.charAt(0).toUpperCase() + track.difficulty.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.trackDescription}>{track.description}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lessons.length}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{track.totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{track.estimatedHours}h</Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {completedCount > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {completedCount} / {lessons.length} lessons completed
                </Text>
                <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.xpEarned}>{totalXPEarned} / {track.totalXP} XP earned</Text>
            </View>
          )}
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={styles.lessonsTitle}>Lessons</Text>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progress={lessonProgress.get(lesson.id) || null}
              onPress={handleLessonPress}
            />
          ))}
        </View>

        {lessons.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lessons available for this track yet.</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Back Arrow
  backArrow: {
    marginLeft: 20,
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backArrowText: {
    fontSize: 20,
    color: '#333',
  },

  // Track Header
  trackHeader: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  trackTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 32,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  trackDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
  },

  // Progress
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  xpEarned: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },

  // Lessons Section
  lessonsSection: {
    paddingHorizontal: 16,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  // Lesson Card
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonCardCompleted: {
    opacity: 0.75,
  },
  lessonCardLeft: {
    marginRight: 14,
    paddingTop: 2,
  },
  lessonOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonOrderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  lessonOrderCheckmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  lessonCardContent: {
    flex: 1,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  lessonTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  lessonDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 10,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  lessonMetaText: {
    fontSize: 12,
    color: '#999',
  },

  // Empty
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});
