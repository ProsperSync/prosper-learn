import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  requestNotificationPermissions,
  scheduleDailyStreakReminder,
} from '../lib/notifications/notificationService';
import { trackOnboardingCompleted } from '../lib/analytics/analyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

type Category = {
  key: string;
  emoji: string;
  labelKey: string;
};

const CATEGORIES: Category[] = [
  { key: 'basics', emoji: '📖', labelKey: 'education.categories.basics' },
  { key: 'budgeting', emoji: '💰', labelKey: 'education.categories.budgeting' },
  { key: 'investing', emoji: '📈', labelKey: 'education.categories.investing' },
  { key: 'debt', emoji: '💳', labelKey: 'education.categories.debt' },
  { key: 'goals', emoji: '🎯', labelKey: 'education.categories.goals' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const completeOnboarding = async (skipped: boolean) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error('[Onboarding] Failed to save onboarding flag:', error);
    }

    // Analytics: track onboarding completion
    trackOnboardingCompleted(skipped);

    // Request notification permissions at the end of onboarding (non-blocking).
    // If granted, schedule the daily streak reminder at 8 PM local time.
    try {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyStreakReminder(20, 0);
      }
    } catch (err) {
      console.warn('[Onboarding] Failed to set up notifications:', err);
    }

    router.replace('/');
  };

  const handleNext = () => {
    if (currentPage < 2) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    } else {
      completeOnboarding(false);
    }
  };

  const handleSkip = () => {
    completeOnboarding(true);
  };

  const handleCategorySelect = (key: string) => {
    setSelectedCategory(key === selectedCategory ? null : key);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
  };

  const renderPage1 = () => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <View style={styles.pageContent}>
        <Text style={styles.heroEmoji}>💰</Text>
        <Text style={styles.pageTitle}>{t('onboarding.welcomeTitle')}</Text>
        <Text style={styles.pageDescription}>{t('onboarding.welcomeDescription')}</Text>

        <View style={styles.featureList}>
          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>📚</Text>
            <Text style={styles.featureText}>{t('onboarding.feature1')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>⭐</Text>
            <Text style={styles.featureText}>{t('onboarding.feature2')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>🏆</Text>
            <Text style={styles.featureText}>{t('onboarding.feature3')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPage2 = () => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <View style={styles.pageContent}>
        <Text style={styles.heroEmoji}>🗺️</Text>
        <Text style={styles.pageTitle}>{t('onboarding.tracksTitle')}</Text>
        <Text style={styles.pageDescription}>{t('onboarding.tracksDescription')}</Text>

        <View style={styles.trackDemo}>
          <View style={styles.trackDemoCard}>
            <View style={styles.trackDemoHeader}>
              <Text style={styles.trackDemoEmoji}>📖</Text>
              <View style={styles.trackDemoBadge}>
                <Text style={styles.trackDemoBadgeText}>{t('education.difficulty.beginner')}</Text>
              </View>
            </View>
            <Text style={styles.trackDemoTitle}>{t('onboarding.sampleTrackTitle')}</Text>
            <View style={styles.trackDemoMeta}>
              <Text style={styles.trackDemoMetaText}>📝 5 {t('education.track.lessons')}</Text>
              <Text style={styles.trackDemoMetaText}>⭐ 250 XP</Text>
            </View>
            <View style={styles.trackDemoProgress}>
              <View style={[styles.trackDemoProgressFill, { width: '40%' }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPage3 = () => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <View style={styles.pageContent}>
        <Text style={styles.heroEmoji}>🎯</Text>
        <Text style={styles.pageTitle}>{t('onboarding.pickTitle')}</Text>
        <Text style={styles.pageDescription}>{t('onboarding.pickDescription')}</Text>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryCard,
                selectedCategory === cat.key && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === cat.key && styles.categoryLabelSelected,
                ]}
              >
                {t(cat.labelKey)}
              </Text>
              {selectedCategory === cat.key && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const pages = [renderPage1, renderPage2, renderPage3];

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </Pressable>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={({ item: renderFn }) => renderFn()}
        keyExtractor={(_, index) => `page-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom: dots + button */}
      <View style={styles.bottomSection}>
        {/* Page indicators */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.dot, currentPage === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Action button */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === 2 ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: 400,
  },
  heroEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  pageDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  // Page 1 — features
  featureList: {
    width: '100%',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  // Page 2 — track demo
  trackDemo: {
    width: '100%',
  },
  trackDemoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackDemoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackDemoEmoji: {
    fontSize: 32,
  },
  trackDemoBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackDemoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  trackDemoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  trackDemoMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  trackDemoMetaText: {
    fontSize: 13,
    color: '#666',
  },
  trackDemoProgress: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackDemoProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  // Page 3 — category selection
  categoryGrid: {
    width: '100%',
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FFF0',
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryLabelSelected: {
    color: '#4CAF50',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Bottom section
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 16,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
