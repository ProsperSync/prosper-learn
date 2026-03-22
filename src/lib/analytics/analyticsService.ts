import PostHog from 'posthog-react-native';

/**
 * Analytics Service — wraps PostHog event tracking.
 *
 * All functions are no-ops (fail silently) when the PostHog API key is not
 * configured, so the app never crashes due to missing analytics credentials.
 */

let posthogClient: PostHog | null = null;

/**
 * Set the shared PostHog client reference so event functions can use it.
 * Called once from the PostHogProvider setup in _layout.tsx.
 */
export function setPostHogClient(client: PostHog | null): void {
  posthogClient = client;
}

// ---------------------------------------------------------------------------
// Event tracking functions
// ---------------------------------------------------------------------------

/**
 * Track when a user starts a lesson.
 */
export function trackLessonStarted(lessonId: string, trackId: string): void {
  try {
    posthogClient?.capture('lesson_started', { lessonId, trackId });
  } catch {
    // no-op
  }
}

/**
 * Track when a user completes a lesson.
 */
export function trackLessonCompleted(lessonId: string, xpEarned: number): void {
  try {
    posthogClient?.capture('lesson_completed', { lessonId, xpEarned });
  } catch {
    // no-op
  }
}

/**
 * Track when a user selects (opens) a learning track.
 */
export function trackTrackSelected(trackId: string, difficulty: string): void {
  try {
    posthogClient?.capture('track_selected', { trackId, difficulty });
  } catch {
    // no-op
  }
}

/**
 * Track when a user completes (or skips) the onboarding flow.
 */
export function trackOnboardingCompleted(skipped: boolean): void {
  try {
    posthogClient?.capture('onboarding_completed', { skipped });
  } catch {
    // no-op
  }
}

/**
 * Track when a user hits a streak milestone (3, 7, 14, 30 days).
 */
export function trackStreakMilestone(days: number): void {
  try {
    posthogClient?.capture('streak_milestone', { days });
  } catch {
    // no-op
  }
}

/**
 * Track when a user unlocks a badge.
 */
export function trackBadgeUnlocked(badgeId: string, badgeName: string): void {
  try {
    posthogClient?.capture('badge_unlocked', { badgeId, badgeName });
  } catch {
    // no-op
  }
}
