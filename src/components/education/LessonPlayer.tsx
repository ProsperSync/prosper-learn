import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Lesson, UserProgress } from '../../lib/types';
import { educationalTrackEngine } from '../../lib/ai';
import { educationalService } from '../../services';

interface LessonPlayerProps {
  lesson: Lesson;
  trackId: string;
  userId: string;
  onComplete: (quizScore?: number) => void;
  onNext?: () => void;
}

export function LessonPlayer({ lesson, trackId, userId, onComplete, onNext }: LessonPlayerProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    loadProgress();
  }, [lesson.id]);

  const loadProgress = async () => {
    const p = await educationalService.getLessonProgressById(userId, trackId, lesson.id);
    setProgress(p);

    // Start lesson if not started
    if (!p) {
      await educationalService.startLesson(userId, trackId, lesson.id);
      loadProgress();
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    if (!lesson.content.quizQuestions) return;

    if (quizAnswers.length < lesson.content.quizQuestions.length) {
      Alert.alert(t('education.quiz.incompleteTitle'), t('education.quiz.incompleteMessage'));
      return;
    }

    try {
      const result = educationalTrackEngine.scoreQuiz(trackId, lesson.id, quizAnswers);
      setQuizResult(result);
      setQuizSubmitted(true);

      if (result.passed) {
        await educationalService.completeLesson(userId, trackId, lesson.id, result.score);
        onComplete(result.score);
      } else {
        Alert.alert(
          t('education.quiz.failedTitle'),
          t('education.quiz.failedMessage', { score: result.score }),
          [
            {
              text: t('education.quiz.tryAgain'),
              onPress: () => {
                setQuizAnswers([]);
                setQuizSubmitted(false);
                setQuizResult(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      Alert.alert(t('common.error'), t('education.quiz.submitError'));
    }
  };

  const handleComplete = async () => {
    try {
      await educationalService.completeLesson(userId, trackId, lesson.id);
      onComplete();
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      Alert.alert(t('common.error'), t('education.lesson.completeError'));
    }
  };

  const renderArticle = () => (
    <View style={styles.articleContainer}>
      <Text style={styles.articleBody}>{lesson.content.body}</Text>

      {progress?.status !== 'completed' && (
        <Pressable style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>{t('education.lesson.markComplete')}</Text>
        </Pressable>
      )}

      {progress?.status === 'completed' && onNext && (
        <Pressable style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>{t('education.lesson.nextLesson')}</Text>
        </Pressable>
      )}
    </View>
  );

  const renderVideo = () => (
    <View style={styles.videoContainer}>
      <Text style={styles.videoPlaceholder}>🎥 {t('education.lesson.videoPlayer')}</Text>
      <Text style={styles.videoUrl}>{lesson.content.videoUrl}</Text>

      {progress?.status !== 'completed' && (
        <Pressable style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>{t('education.lesson.markComplete')}</Text>
        </Pressable>
      )}

      {progress?.status === 'completed' && onNext && (
        <Pressable style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>{t('education.lesson.nextLesson')}</Text>
        </Pressable>
      )}
    </View>
  );

  const renderQuiz = () => {
    if (!lesson.content.quizQuestions) return null;

    return (
      <View style={styles.quizContainer}>
        {lesson.content.quizQuestions.map((question, qIndex) => (
          <View key={question.id} style={styles.quizQuestion}>
            <Text style={styles.questionNumber}>
              {t('education.quiz.question')} {qIndex + 1}
            </Text>
            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option, oIndex) => {
                const isSelected = quizAnswers[qIndex] === oIndex;
                const isCorrect = question.correctAnswer === oIndex;
                const showResult = quizSubmitted;

                return (
                  <Pressable
                    key={oIndex}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                      showResult && isSelected && isCorrect && styles.optionCorrect,
                      showResult && isSelected && !isCorrect && styles.optionIncorrect,
                      showResult && !isSelected && isCorrect && styles.optionCorrect,
                    ]}
                    onPress={() => !quizSubmitted && handleQuizAnswer(qIndex, oIndex)}
                    disabled={quizSubmitted}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        showResult && isCorrect && styles.optionTextCorrect,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {quizSubmitted && question.explanation && (
              <View style={styles.explanation}>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            )}
          </View>
        ))}

        {!quizSubmitted && (
          <Pressable
            style={[
              styles.submitButton,
              quizAnswers.length < lesson.content.quizQuestions.length &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleQuizSubmit}
          >
            <Text style={styles.submitButtonText}>{t('education.quiz.submit')}</Text>
          </Pressable>
        )}

        {quizSubmitted && quizResult && (
          <View style={styles.quizResult}>
            <Text style={styles.quizResultTitle}>
              {quizResult.passed ? t('education.quiz.passed') : t('education.quiz.failed')}
            </Text>
            <Text style={styles.quizResultScore}>
              {t('education.quiz.score')}: {quizResult.score}%
            </Text>
            <Text style={styles.quizResultDetails}>
              {quizResult.correctAnswers} / {quizResult.totalQuestions}{' '}
              {t('education.quiz.correct')}
            </Text>

            {quizResult.passed && onNext && (
              <Pressable style={styles.nextButton} onPress={onNext}>
                <Text style={styles.nextButtonText}>{t('education.lesson.nextLesson')}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>

          <View style={styles.lessonMeta}>
            {lesson.duration && <Text style={styles.metaText}>⏱️ {lesson.duration} min</Text>}
            <Text style={styles.metaText}>⭐ +{lesson.xpReward} XP</Text>
          </View>

          {progress?.status === 'completed' && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ {t('education.completed')}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.lessonContent}>
          {lesson.type === 'article' && renderArticle()}
          {lesson.type === 'video' && renderVideo()}
          {lesson.type === 'quiz' && renderQuiz()}
          {lesson.type === 'interactive' && (
            <View style={styles.interactiveContainer}>
              <Text style={styles.interactivePlaceholder}>
                {t('education.lesson.interactiveContent')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  lessonContent: {
    flex: 1,
  },
  articleContainer: {
    flex: 1,
  },
  articleBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    marginBottom: 24,
  },
  videoContainer: {
    flex: 1,
  },
  videoPlaceholder: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
  },
  videoUrl: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  quizContainer: {
    flex: 1,
  },
  quizQuestion: {
    marginBottom: 32,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
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
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  optionTextCorrect: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  explanation: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  quizResult: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
  },
  quizResultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  quizResultScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  quizResultDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  interactiveContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  interactivePlaceholder: {
    fontSize: 16,
    color: '#666',
  },
});
