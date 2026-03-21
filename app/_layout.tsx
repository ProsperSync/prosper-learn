import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { ONBOARDING_COMPLETE_KEY } from '../src/screens/OnboardingScreen';
import ErrorBoundary from '../src/components/ErrorBoundary';
import '../src/i18n';

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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}

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
