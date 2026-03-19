import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EducationalTrack, Lesson, UserProgress, TrackProgress } from '../lib/types';
import { educationalTrackEngine } from '../lib/ai';

/**
 * Educational Service
 * Manages persistence of educational progress with offline-first AsyncStorage
 */

const STORAGE_KEYS = {
  LESSON_PROGRESS: '@education/lesson_progress',
  TRACK_PROGRESS: '@education/track_progress',
  CACHED_CONTENT: '@education/cached_content',
};

export class EducationalService {
  /**
   * Lesson Progress
   */
  async saveLessonProgress(progress: UserProgress): Promise<void> {
    const allProgress = await this.getLessonProgress(progress.userId);
    const existing = allProgress.findIndex(
      (p) => p.trackId === progress.trackId && p.lessonId === progress.lessonId
    );

    if (existing >= 0) {
      allProgress[existing] = progress;
    } else {
      allProgress.push(progress);
    }

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.LESSON_PROGRESS}:${progress.userId}`,
      JSON.stringify(allProgress)
    );

    // Update track progress
    await this.updateTrackProgress(progress.userId, progress.trackId);
  }

  async getLessonProgress(userId: string, trackId?: string): Promise<UserProgress[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.LESSON_PROGRESS}:${userId}`);
      const progress: UserProgress[] = data ? JSON.parse(data) : [];
      return trackId ? progress.filter((p) => p.trackId === trackId) : progress;
    } catch {
      return [];
    }
  }

  async getLessonProgressById(
    userId: string,
    trackId: string,
    lessonId: string
  ): Promise<UserProgress | null> {
    const progress = await this.getLessonProgress(userId, trackId);
    return progress.find((p) => p.lessonId === lessonId) || null;
  }

  /**
   * Track Progress
   */
  async updateTrackProgress(userId: string, trackId: string): Promise<TrackProgress | null> {
    const lessonProgress = await this.getLessonProgress(userId, trackId);
    const trackProgress = educationalTrackEngine.calculateTrackProgress(trackId, lessonProgress);

    if (!trackProgress) return null;

    const allTrackProgress = await this.getAllTrackProgress(userId);
    const existing = allTrackProgress.findIndex((p) => p.trackId === trackId);

    if (existing >= 0) {
      allTrackProgress[existing] = trackProgress;
    } else {
      allTrackProgress.push(trackProgress);
    }

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.TRACK_PROGRESS}:${userId}`,
      JSON.stringify(allTrackProgress)
    );

    return trackProgress;
  }

  async getTrackProgress(userId: string, trackId: string): Promise<TrackProgress | null> {
    const allProgress = await this.getAllTrackProgress(userId);
    return allProgress.find((p) => p.trackId === trackId) || null;
  }

  async getAllTrackProgress(userId: string): Promise<TrackProgress[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.TRACK_PROGRESS}:${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Start a lesson
   */
  async startLesson(userId: string, trackId: string, lessonId: string): Promise<UserProgress> {
    const existing = await this.getLessonProgressById(userId, trackId, lessonId);

    if (existing) {
      // Update last accessed
      existing.lastAccessedAt = new Date().toISOString();
      await this.saveLessonProgress(existing);
      return existing;
    }

    // Create new progress
    const progress: UserProgress = {
      id: crypto.randomUUID(),
      userId,
      trackId,
      lessonId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      attempts: 0,
      timeSpent: 0,
    };

    await this.saveLessonProgress(progress);
    return progress;
  }

  /**
   * Complete a lesson
   */
  async completeLesson(
    userId: string,
    trackId: string,
    lessonId: string,
    quizScore?: number
  ): Promise<UserProgress> {
    const progress = await this.getLessonProgressById(userId, trackId, lessonId);

    if (!progress) {
      throw new Error('Lesson progress not found');
    }

    progress.status = 'completed';
    progress.completedAt = new Date().toISOString();
    progress.lastAccessedAt = new Date().toISOString();

    if (quizScore !== undefined) {
      progress.quizScore = Math.max(progress.quizScore || 0, quizScore);
      progress.attempts = (progress.attempts || 0) + 1;
    }

    await this.saveLessonProgress(progress);
    return progress;
  }

  /**
   * Update time spent on lesson
   */
  async updateTimeSpent(
    userId: string,
    trackId: string,
    lessonId: string,
    additionalSeconds: number
  ): Promise<void> {
    const progress = await this.getLessonProgressById(userId, trackId, lessonId);

    if (progress) {
      progress.timeSpent = (progress.timeSpent || 0) + additionalSeconds;
      progress.lastAccessedAt = new Date().toISOString();
      await this.saveLessonProgress(progress);
    }
  }

  /**
   * Get completed tracks
   */
  async getCompletedTracks(userId: string): Promise<EducationalTrack[]> {
    const allProgress = await this.getAllTrackProgress(userId);
    const completedIds = allProgress.filter((p) => p.isCompleted).map((p) => p.trackId);

    return completedIds
      .map((id) => educationalTrackEngine.getTrack(id))
      .filter((track): track is EducationalTrack => track !== undefined);
  }

  /**
   * Get in-progress tracks
   */
  async getInProgressTracks(userId: string): Promise<EducationalTrack[]> {
    const allProgress = await this.getAllTrackProgress(userId);
    const inProgressIds = allProgress
      .filter((p) => !p.isCompleted && p.completedLessons > 0)
      .map((p) => p.trackId);

    return inProgressIds
      .map((id) => educationalTrackEngine.getTrack(id))
      .filter((track): track is EducationalTrack => track !== undefined);
  }

  /**
   * Calculate quiz average
   */
  async getQuizAverage(userId: string): Promise<number> {
    const allProgress = await this.getLessonProgress(userId);
    const quizScores = allProgress
      .filter((p) => p.quizScore !== undefined && p.status === 'completed')
      .map((p) => p.quizScore!);

    if (quizScores.length === 0) return 0;

    const sum = quizScores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / quizScores.length);
  }

  /**
   * Get recommended tracks
   */
  async getRecommendedTracks(userId: string): Promise<EducationalTrack[]> {
    const completed = await this.getCompletedTracks(userId);
    const completedIds = completed.map((t) => t.id);
    return educationalTrackEngine.getRecommendedTracks(completedIds);
  }

  /**
   * Cache track content for offline access
   */
  async cacheTrackContent(trackId: string): Promise<void> {
    const track = educationalTrackEngine.getTrack(trackId);
    if (!track || !track.isOfflineAvailable) return;

    const lessons = educationalTrackEngine.getTrackLessons(trackId);
    const cacheData = {
      track,
      lessons,
      cachedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CACHED_CONTENT}:${trackId}`,
      JSON.stringify(cacheData)
    );
  }

  async getCachedTrack(trackId: string): Promise<{
    track: EducationalTrack;
    lessons: Lesson[];
    cachedAt: string;
  } | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHED_CONTENT}:${trackId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear all data (for testing or logout)
   */
  async clearAllData(userId: string): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(`${STORAGE_KEYS.LESSON_PROGRESS}:${userId}`),
      AsyncStorage.removeItem(`${STORAGE_KEYS.TRACK_PROGRESS}:${userId}`),
    ]);
  }
}

// Global instance
export const educationalService = new EducationalService();
