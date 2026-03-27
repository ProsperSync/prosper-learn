import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import type { Lesson, Streak } from '../../src/lib/types';
import { educationalTrackEngine, xpCalculator } from '../../src/lib/ai';
import { educationalService, gamificationService } from '../../src/services';
import { useAuth } from '../../src/hooks/useAuth';
import { maybeRequestReview } from '../../src/lib/reviews/reviewService';
import {
  trackLessonStarted,
  trackLessonCompleted,
  trackStreakMilestone,
} from '../../src/lib/analytics/analyticsService';
import { shareLessonCompletion } from '../../src/lib/sharing/sharingService';

type QuizAnswer = {
  questionIndex: number;
  selectedOption: number;
};

/**
 * Updates the daily learning streak for the user.
 * - If no streak exists, creates one with currentStreak: 1
 * - If already incremented today, does nothing (idempotent)
 * - If last activity was yesterday, increments the streak
 * - If last activity was older, resets streak to 1 (streak broken)
 * - Updates longestStreak if currentStreak exceeds it
 */
async function updateDailyStreak(userId: string): Promise<void> {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const streakType = 'educational';

  const existingStreak = await gamificationService.getStreakByType(userId, streakType);

  if (!existingStreak) {
    // Create a new streak
    const newStreak: Streak = {
      id: `streak-${userId}-${streakType}-${Date.now()}`,
      userId,
      type: streakType,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: todayStr,
      startDate: todayStr,
      isActive: true,
      milestones: [
        { days: 3 },
        { days: 7 },
        { days: 14 },
        { days: 30 },
      ],
    };
    await gamificationService.saveStreak(newStreak);
    return;
  }

  // Already incremented today — idempotent
  const lastActivityDate = parseISO(existingStreak.lastActivityDate);
  if (isToday(lastActivityDate)) {
    return;
  }

  // Determine if streak continues or resets
  const wasYesterday = isYesterday(lastActivityDate);
  const newCurrentStreak = wasYesterday ? existingStreak.currentStreak + 1 : 1;
  const newLongestStreak = Math.max(existingStreak.longestStreak, newCurrentStreak);

  // Update milestones if any were reached
  const updatedMilestones = existingStreak.milestones?.map((m) => {
    if (!m.reachedAt && newCurrentStreak >= m.days) {
      return { ...m, reachedAt: todayStr };
    }
    return m;
  });

  const updatedStreak: Streak = {
    ...existingStreak,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: todayStr,
    startDate: wasYesterday ? existingStreak.startDate : todayStr,
    milestones: updatedMilestones,
  };

  await gamificationService.saveStreak(updatedStreak);
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);

  // Completion state
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [successOpacity] = useState(new Animated.Value(0));

  // Load lesson data
  useEffect(() => {
    if (!id) {
      setError('No lesson ID provided');
      setLoading(false);
      return;
    }

    try {
      const lessonData = educationalTrackEngine.getLessonById(id);
      if (!lessonData) {
        setError('Lesson not found');
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // Mark lesson as started
      if (userId) {
        educationalService.startLesson(userId, lessonData.trackId, lessonData.id).catch(() => {
          // Silently fail — lesson can still be read
        });
        trackLessonStarted(lessonData.id, lessonData.trackId);
      }
    } catch (err) {
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  // Show success animation
  const showSuccess = useCallback(() => {
    setCompleted(true);
    Animated.sequence([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [successOpacity]);

  // Handle quiz answer selection
  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;

    setQuizAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionIndex === questionIndex);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionIndex, selectedOption: optionIndex };
        return updated;
      }
      return [...prev, { questionIndex, selectedOption: optionIndex }];
    });
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    if (!lesson || !lesson.content.quizQuestions) return;

    const questions = lesson.content.quizQuestions;
    const answers = questions.map((_, idx) => {
      const answer = quizAnswers.find((a) => a.questionIndex === idx);
      return answer?.selectedOption ?? -1;
    });

    try {
      const result = educationalTrackEngine.scoreQuiz(lesson.trackId, lesson.id, answers);
      setQuizScore(result.score);
      setQuizPassed(result.passed);
      setQuizSubmitted(true);
    } catch {
      // If scoring fails, calculate manually
      let correct = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) correct++;
      });
      const score = Math.round((correct / questions.length) * 100);
      setQuizScore(score);
      setQuizPassed(score >= 70);
      setQuizSubmitted(true);
    }
  };

  // Complete lesson
  const handleCompleteLesson = async () => {
    if (!lesson || !userId || completing) return;

    setCompleting(true);
    try {
      // Complete lesson in educational service
      await educationalService.completeLesson(
        userId,
        lesson.trackId,
        lesson.id,
        quizScore ?? undefined
      );

      // Award XP
      const xpReward = lesson.xpReward || 0;
      let totalXPEarned = xpReward;

      // Bonus XP for quiz
      if (lesson.type === 'quiz' && quizPassed) {
        const quizXP = xpCalculator.calculateXP('quiz_passed');
        totalXPEarned += quizXP;
      }
      if (quizScore === 100) {
        const perfectXP = xpCalculator.calculateXP('perfect_quiz');
        totalXPEarned += perfectXP;
      }

      // Save XP event
      const xpEvent = {
        id: crypto.randomUUID(),
        userId,
        type: 'lesson_completed' as const,
        points: totalXPEarned,
        earnedAt: new Date().toISOString(),
        metadata: {
          lessonId: lesson.id,
          trackId: lesson.trackId,
          lessonTitle: lesson.title,
          quizScore: quizScore ?? undefined,
        },
      };
      await gamificationService.saveXPEvent(xpEvent);

      // Update user XP
      const currentXP = await gamificationService.getUserXP(userId);
      const newTotalXP = (currentXP?.totalXP || 0) + totalXPEarned;
      const updatedXP = xpCalculator.calculateLevel(newTotalXP);
      updatedXP.userId = userId;
      await gamificationService.saveUserXP(updatedXP);

      // Update daily learning streak
      await updateDailyStreak(userId);

      // Analytics: lesson completed
      trackLessonCompleted(lesson.id, totalXPEarned);

      // Analytics: check for streak milestones reached in this session
      try {
        const streak = await gamificationService.getStreakByType(userId, 'educational');
        if (streak?.milestones) {
          for (const m of streak.milestones) {
            if (m.reachedAt && m.reachedAt === format(new Date(), 'yyyy-MM-dd')) {
              trackStreakMilestone(m.days);
            }
          }
        }
      } catch {
        // analytics should never block the main flow
      }

      setEarnedXP(totalXPEarned);
      showSuccess();

      // Prompt for in-app review after 5th lesson (non-blocking, shown at most once)
      const allXPEvents = await gamificationService.getXPEvents(userId);
      const completedLessonCount = allXPEvents.filter(
        (e) => e.type === 'lesson_completed'
      ).length;
      maybeRequestReview(completedLessonCount).catch(() => {});
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      // Still show success if the lesson itself was likely completed
      setEarnedXP(lesson.xpReward || 0);
      showSuccess();
    } finally {
      setCompleting(false);
    }
  };

  // Get answer for a question
  const getSelectedAnswer = (questionIndex: number): number | undefined => {
    return quizAnswers.find((a) => a.questionIndex === questionIndex)?.selectedOption;
  };

  // Check if all quiz questions are answered
  const allQuestionsAnswered =
    lesson?.content.quizQuestions
      ? quizAnswers.length === lesson.content.quizQuestions.length
      : false;

  // --- RENDER ---

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Lesson Not Found</Text>
        <Text style={styles.errorMessage}>
          {error || "We couldn't find this lesson. It may have been removed or the link is incorrect."}
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Success Toast */}
      {completed && (
        <Animated.View style={[styles.successToast, { opacity: successOpacity }]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Lesson Complete!</Text>
            <Text style={styles.successXP}>+{earnedXP} XP earned</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backArrow} onPress={() => router.back()}>
            <Text style={styles.backArrowText}>←</Text>
          </Pressable>
          <View style={styles.lessonMeta}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(lesson.type) }]}>
              <Text style={styles.typeBadgeText}>
                {getTypeEmoji(lesson.type)} {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
              </Text>
            </View>
            {lesson.duration && (
              <Text style={styles.durationText}>⏱️ {lesson.duration} min</Text>
            )}
            <Text style={styles.xpText}>⭐ {lesson.xpReward} XP</Text>
          </View>
        </View>

        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description}>{lesson.description}</Text>

        {/* Article / Text Content */}
        {(lesson.type === 'article' || lesson.type === 'interactive' || lesson.type === 'challenge') &&
          lesson.content.body && (
            <View style={styles.articleContainer}>
              <Text style={styles.articleBody}>{lesson.content.body}</Text>
            </View>
          )}

        {/* Video Placeholder */}
        {lesson.type === 'video' && (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoIcon}>🎥</Text>
            <Text style={styles.videoText}>Video content</Text>
            {lesson.content.body && (
              <Text style={styles.articleBody}>{lesson.content.body}</Text>
            )}
          </View>
        )}

        {/* Quiz Content */}
        {lesson.type === 'quiz' && lesson.content.quizQuestions && (
          <View style={styles.quizContainer}>
            <Text style={styles.quizHeader}>📝 Quiz — {lesson.content.quizQuestions.length} questions</Text>
            <Text style={styles.quizSubheader}>Score 70% or higher to pass</Text>

            {lesson.content.quizQuestions.map((question, qIdx) => {
              const selectedAnswer = getSelectedAnswer(qIdx);
              const isCorrect = selectedAnswer === question.correctAnswer;

              return (
                <View key={question.id} style={styles.questionCard}>
                  <Text style={styles.questionNumber}>Question {qIdx + 1}</Text>
                  <Text style={styles.questionText}>{question.question}</Text>

                  {question.options.map((option, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrectOption = oIdx === question.correctAnswer;

                    let optionStyle = styles.optionDefault;
                    let optionTextStyle = styles.optionTextDefault;

                    if (quizSubmitted) {
                      if (isCorrectOption) {
                        optionStyle = styles.optionCorrect;
                        optionTextStyle = styles.optionTextCorrect;
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = styles.optionIncorrect;
                        optionTextStyle = styles.optionTextIncorrect;
                      }
                    } else if (isSelected) {
                      optionStyle = styles.optionSelected;
                      optionTextStyle = styles.optionTextSelected;
                    }

                    return (
                      <Pressable
                        key={oIdx}
                        style={[styles.optionButton, optionStyle]}
                        onPress={() => handleSelectAnswer(qIdx, oIdx)}
                        disabled={quizSubmitted}
                      >
                        <Text style={[styles.optionLabel, optionTextStyle]}>
                          {String.fromCharCode(65 + oIdx)}.
                        </Text>
                        <Text style={[styles.optionText, optionTextStyle]}>{option}</Text>
                        {quizSubmitted && isCorrectOption && (
                          <Text style={styles.checkMark}>✓</Text>
                        )}
                        {quizSubmitted && isSelected && !isCorrectOption && (
                          <Text style={styles.crossMark}>✗</Text>
                        )}
                      </Pressable>
                    );
                  })}

                  {/* Explanation after submission */}
                  {quizSubmitted && question.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>💡 {question.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Quiz Submit Button */}
            {!quizSubmitted && (
              <Pressable
                style={[
                  styles.submitQuizButton,
                  !allQuestionsAnswered && styles.submitQuizButtonDisabled,
                ]}
                onPress={handleSubmitQuiz}
                disabled={!allQuestionsAnswered}
              >
                <Text style={styles.submitQuizButtonText}>Submit Answers</Text>
              </Pressable>
            )}

            {/* Quiz Results */}
            {quizSubmitted && quizScore !== null && (
              <View style={[styles.quizResult, quizPassed ? styles.quizResultPass : styles.quizResultFail]}>
                <Text style={styles.quizResultEmoji}>{quizPassed ? '🎉' : '📚'}</Text>
                <Text style={styles.quizResultScore}>Score: {quizScore}%</Text>
                <Text style={styles.quizResultMessage}>
                  {quizPassed
                    ? 'Great job! You passed the quiz!'
                    : 'Keep learning! You need 70% to pass.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Body text for quiz lessons (if any) */}
        {lesson.type === 'quiz' && lesson.content.body && (
          <View style={styles.articleContainer}>
            <Text style={styles.articleBody}>{lesson.content.body}</Text>
          </View>
        )}

        {/* Complete Lesson Button */}
        {!completed && (
          <Pressable
            style={[
              styles.completeButton,
              (completing || (lesson.type === 'quiz' && !quizSubmitted)) &&
                styles.completeButtonDisabled,
            ]}
            onPress={handleCompleteLesson}
            disabled={completing || (lesson.type === 'quiz' && !quizSubmitted)}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>
                {lesson.type === 'quiz' && !quizSubmitted
                  ? 'Complete the quiz first'
                  : 'Complete Lesson ✓'}
              </Text>
            )}
          </Pressable>
        )}

        {/* Ask AI Tutor Button (always visible when lesson loaded) */}
        {!completed && (
          <Pressable
            style={styles.askTutorButton}
            onPress={() => router.push({ pathname: '/ai-tutor', params: { lessonId: lesson.id } })}
          >
            <Text style={styles.askTutorButtonText}>Ask AI Tutor</Text>
          </Pressable>
        )}

        {/* Post-Completion Actions */}
        {completed && (
          <View style={styles.postComplete}>
            <Text style={styles.postCompleteEmoji}>✅</Text>
            <Text style={styles.postCompleteTitle}>Lesson Completed!</Text>
            <Text style={styles.postCompleteXP}>You earned {earnedXP} XP</Text>

            <View style={styles.postCompleteActions}>
              <Pressable
                style={styles.shareButtonSmall}
                onPress={() => shareLessonCompletion(lesson.title, earnedXP)}
              >
                <Text style={styles.shareButtonSmallText}>Share</Text>
              </Pressable>
              <Pressable
                style={styles.askTutorButtonSmall}
                onPress={() => router.push({ pathname: '/ai-tutor', params: { lessonId: lesson.id } })}
              >
                <Text style={styles.askTutorButtonSmallText}>Ask AI Tutor</Text>
              </Pressable>
              <Pressable style={styles.nextButton} onPress={() => router.back()}>
                <Text style={styles.nextButtonText}>Back to Track</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helpers
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  backArrow: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 20,
    color: '#333',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  durationText: {
    fontSize: 13,
    color: '#666',
  },
  xpText: {
    fontSize: 13,
    color: '#666',
  },

  // Title & Description
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },

  // Article
  articleContainer: {
    marginBottom: 24,
  },
  articleBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
  },

  // Video placeholder
  videoPlaceholder: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },

  // Quiz
  quizContainer: {
    marginBottom: 24,
  },
  quizHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  quizSubheader: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  optionDefault: {
    backgroundColor: '#fff',
    borderColor: '#E0E0E0',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  optionIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 10,
    minWidth: 22,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  optionTextDefault: {
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  optionTextCorrect: {
    color: '#2E7D32',
  },
  optionTextIncorrect: {
    color: '#C62828',
  },
  checkMark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
  },
  crossMark: {
    fontSize: 18,
    color: '#F44336',
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  submitQuizButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitQuizButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitQuizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  quizResult: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  quizResultPass: {
    backgroundColor: '#E8F5E9',
  },
  quizResultFail: {
    backgroundColor: '#FFF3E0',
  },
  quizResultEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  quizResultScore: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  quizResultMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },

  // Complete Button
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Post-Complete
  postComplete: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  postCompleteEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  postCompleteTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  postCompleteXP: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 20,
  },
  postCompleteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  askTutorButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1.5,
    borderColor: '#2196F3',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  askTutorButtonText: {
    color: '#1565C0',
    fontSize: 15,
    fontWeight: '600',
  },
  shareButtonSmall: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonSmallText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '600',
  },
  askTutorButtonSmall: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1.5,
    borderColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  askTutorButtonSmallText: {
    color: '#1565C0',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Success Toast
  successToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  successEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successXP: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '600',
  },
});
