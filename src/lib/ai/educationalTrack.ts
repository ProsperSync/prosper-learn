import type { EducationalTrack, Lesson, UserProgress, TrackProgress } from '../types';

/**
 * Educational Track Engine
 * Manages learning content and user progress
 */

export class EducationalTrackEngine {
  private tracks: Map<string, EducationalTrack> = new Map();
  private lessons: Map<string, Lesson> = new Map();

  constructor(initialTracks: EducationalTrack[] = [], initialLessons: Lesson[] = []) {
    initialTracks.forEach((track) => this.tracks.set(track.id, track));
    initialLessons.forEach((lesson) => this.lessons.set(lesson.id, lesson));
  }

  /**
   * Get all available tracks
   */
  getTracks(category?: string, difficulty?: string): EducationalTrack[] {
    let tracks = Array.from(this.tracks.values());

    if (category) {
      tracks = tracks.filter((t) => t.category === category);
    }

    if (difficulty) {
      tracks = tracks.filter((t) => t.difficulty === difficulty);
    }

    return tracks;
  }

  /**
   * Get a specific track by ID
   */
  getTrack(trackId: string): EducationalTrack | undefined {
    return this.tracks.get(trackId);
  }

  /**
   * Get track by slug
   */
  getTrackBySlug(slug: string): EducationalTrack | undefined {
    return Array.from(this.tracks.values()).find((t) => t.slug === slug);
  }

  /**
   * Register a new track
   */
  registerTrack(track: EducationalTrack): void {
    this.tracks.set(track.id, track);
  }

  /**
   * Get lesson by ID
   */
  getLesson(trackId: string, lessonId: string): Lesson | undefined {
    const track = this.tracks.get(trackId);
    if (!track || !track.lessons.includes(lessonId)) return undefined;

    return this.lessons.get(lessonId);
  }

  /**
   * Get all lessons for a track
   */
  getTrackLessons(trackId: string): Lesson[] {
    const track = this.tracks.get(trackId);
    if (!track) return [];

    return track.lessons
      .map((lessonId) => this.lessons.get(lessonId))
      .filter((lesson): lesson is Lesson => lesson !== undefined)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Register a new lesson
   */
  registerLesson(lesson: Lesson): void {
    this.lessons.set(lesson.id, lesson);
  }

  /**
   * Calculate track progress
   */
  calculateTrackProgress(trackId: string, lessonProgress: UserProgress[]): TrackProgress | null {
    const track = this.tracks.get(trackId);
    if (!track) return null;

    const completedLessons = lessonProgress.filter((p) => p.status === 'completed').length;
    const totalLessons = track.lessons.length;
    const percentComplete = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const earnedXP = lessonProgress
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => {
        const lesson = this.getLesson(trackId, p.lessonId);
        return sum + (lesson?.xpReward || 0);
      }, 0);

    const startedAt = lessonProgress.reduce(
      (earliest, p) => {
        if (!p.startedAt) return earliest;
        if (!earliest) return p.startedAt;
        return p.startedAt < earliest ? p.startedAt : earliest;
      },
      undefined as string | undefined
    );

    const completedAt =
      completedLessons === totalLessons
        ? lessonProgress.reduce(
            (latest, p) => {
              if (!p.completedAt) return latest;
              if (!latest) return p.completedAt;
              return p.completedAt > latest ? p.completedAt : latest;
            },
            undefined as string | undefined
          )
        : undefined;

    return {
      userId: lessonProgress[0]?.userId || '',
      trackId,
      completedLessons,
      totalLessons,
      percentComplete,
      startedAt,
      completedAt,
      earnedXP,
      isCompleted: completedLessons === totalLessons,
    };
  }

  /**
   * Check if user can access lesson (prerequisites met)
   */
  canAccessLesson(
    trackId: string,
    lessonId: string,
    completedLessonIds: string[]
  ): { canAccess: boolean; missingPrerequisites: string[] } {
    const lesson = this.getLesson(trackId, lessonId);
    if (!lesson) {
      return { canAccess: false, missingPrerequisites: [] };
    }

    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return { canAccess: true, missingPrerequisites: [] };
    }

    const missingPrerequisites = lesson.prerequisites.filter(
      (prereq) => !completedLessonIds.includes(prereq)
    );

    return {
      canAccess: missingPrerequisites.length === 0,
      missingPrerequisites,
    };
  }

  /**
   * Score a quiz
   */
  scoreQuiz(
    trackId: string,
    lessonId: string,
    answers: number[]
  ): { score: number; correctAnswers: number; totalQuestions: number; passed: boolean } {
    const lesson = this.getLesson(trackId, lessonId);
    if (!lesson || lesson.type !== 'quiz' || !lesson.content.quizQuestions) {
      throw new Error('Lesson is not a quiz or does not have questions');
    }

    const questions = lesson.content.quizQuestions;
    if (answers.length !== questions.length) {
      throw new Error('Answer count does not match question count');
    }

    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 70; // 70% passing grade

    return {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      passed,
    };
  }

  /**
   * Get next lesson in track
   */
  getNextLesson(trackId: string, currentLessonId: string): Lesson | undefined {
    const track = this.tracks.get(trackId);
    if (!track) return undefined;

    const currentIndex = track.lessons.indexOf(currentLessonId);
    if (currentIndex === -1 || currentIndex === track.lessons.length - 1) {
      return undefined;
    }

    const nextLessonId = track.lessons[currentIndex + 1];
    return this.lessons.get(nextLessonId);
  }

  /**
   * Get recommended tracks based on completed tracks
   */
  getRecommendedTracks(completedTrackIds: string[]): EducationalTrack[] {
    const completed = new Set(completedTrackIds);
    const allTracks = Array.from(this.tracks.values());

    // Recommend tracks with prerequisites met
    return allTracks
      .filter((track) => !completed.has(track.id))
      .filter((track) => {
        if (!track.prerequisites || track.prerequisites.length === 0) {
          return true;
        }
        return track.prerequisites.every((prereq) => completed.has(prereq));
      })
      .sort((a, b) => {
        // Sort by difficulty (beginner first)
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
  }
}

// Import comprehensive educational content
import { ALL_LESSONS, ALL_TRACKS } from './educationalContent';

/**
 * Default Educational Content
 * 
 * Using comprehensive content library with 10 tracks and 30+ lessons
 */

export const DEFAULT_LESSONS: Lesson[] = ALL_LESSONS;
export const DEFAULT_TRACKS: EducationalTrack[] = ALL_TRACKS;

// Global instance with comprehensive content
export const educationalTrackEngine = new EducationalTrackEngine(DEFAULT_TRACKS, DEFAULT_LESSONS);
