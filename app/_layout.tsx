import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { ONBOARDING_COMPLETE_KEY } from '../src/screens/OnboardingScreen';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { initSentry, wrapWithSentry } from '../src/lib/sentry/sentryService';
import { setPostHogClient } from '../src/lib/analytics/analyticsService';
import '../src/i18n';

// Initialize Sentry before any UI renders
initSentry();

// PostHog configuration — no-op when API key is absent
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

/**
 * Bridges the PostHog client instance from the provider context into the
 * analytics service module so that standalone event functions can fire events.
 */
function PostHogBridge({ children }: { children: React.ReactNode }) {
  const posthog = usePostHog();
  useEffect(() => {
    setPostHogClient(posthog);
    return () => setPostHogClient(null);
  }, [posthog]);
  return <>{children}</>;
}

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true); // default true to avoid flash

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
      .then((value) => {
        setOnboardingComplete(value === 'true');
      })
      .catch(() => {
        // If read fails, assume complete to avoid blocking the app
        setOnboardingComplete(true);
      })
      .finally(() => {
        setOnboardingChecked(true);
      });
  }, []);

  useEffect(() => {
    if (loading || !onboardingChecked) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inPrivacyPolicy = segments[0] === 'privacy-policy';
    const inTermsOfService = segments[0] === 'terms-of-service';

    // Allow unauthenticated access to legal pages
    if (inPrivacyPolicy || inTermsOfService) return;

    if (!session && !inAuthGroup) {
      // Redirect to auth screen if not authenticated
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // Authenticated user on auth screen — check onboarding
      if (!onboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace('/');
      }
    } else if (session && !onboardingComplete && !inOnboarding) {
      // Authenticated but hasn't completed onboarding
      router.replace('/onboarding');
    } else if (session && onboardingComplete && inOnboarding) {
      // Onboarding already done, redirect to main app
      router.replace('/');
    }
  }, [session, loading, segments, onboardingChecked, onboardingComplete]);

  // Listen for onboarding completion (when user finishes onboarding, AsyncStorage is set)
  useEffect(() => {
    if (!onboardingChecked) return;
    // Re-check onboarding flag when navigating away from onboarding
    const inOnboarding = segments[0] === 'onboarding';
    if (!inOnboarding && !onboardingComplete) {
      AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY).then((value) => {
        if (value === 'true') {
          setOnboardingComplete(true);
        }
      });
    }
  }, [segments, onboardingChecked, onboardingComplete]);

  if (loading || !onboardingChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="track/[id]"
          options={{ headerShown: true, title: 'Track Details', presentation: 'card' }}
        />
        <Stack.Screen
          name="lesson/[id]"
          options={{ headerShown: true, title: 'Lesson', presentation: 'card' }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
    </>
  );
}

function RootLayoutInner() {
  return (
    <ErrorBoundary>
      <PostHogBridge>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </PostHogBridge>
    </ErrorBoundary>
  );
}

function RootLayout() {
  // When PostHog API key is absent, the provider still renders children
  // but no events are sent — this keeps the app fully functional.
  if (!POSTHOG_API_KEY) {
    return <RootLayoutInner />;
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{ host: POSTHOG_HOST }}
      autocapture={false}
    >
      <RootLayoutInner />
    </PostHogProvider>
  );
}

// Wrap with Sentry for automatic performance monitoring and error tracking
export default wrapWithSentry(RootLayout);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
