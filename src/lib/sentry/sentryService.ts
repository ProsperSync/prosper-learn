import * as Sentry from '@sentry/react-native';

/**
 * Sentry Crash Reporting & Observability Service
 *
 * Initializes Sentry for automatic unhandled exception capture, breadcrumbs,
 * and performance monitoring. Uses `EXPO_PUBLIC_SENTRY_DSN` env var for configuration.
 *
 * Usage:
 *   1. Call `initSentry()` once at app startup (before any UI renders)
 *   2. Use `captureError()` in ErrorBoundary and other catch blocks
 *   3. Use `setUserContext()` after authentication to associate errors with users
 */

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

/**
 * Initialize Sentry. Must be called before any React rendering.
 * If EXPO_PUBLIC_SENTRY_DSN is not set, Sentry will be initialized in
 * disabled mode (no-op) — safe for development.
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN configured (EXPO_PUBLIC_SENTRY_DSN is empty). Sentry is disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Enable performance monitoring (sample 20% of transactions in production)
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Disable in development to avoid noise
    enabled: !__DEV__,
    // Add breadcrumbs for navigation and user actions
    enableAutoSessionTracking: true,
    // Attach stack traces to all messages
    attachStacktrace: true,
    // Environment tag
    environment: __DEV__ ? 'development' : 'production',
  });
}

/**
 * Capture an exception in Sentry with optional extra context.
 * Used by ErrorBoundary.componentDidCatch and any other catch blocks.
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) {
    // Sentry not configured — log only
    console.error('[Sentry:disabled] Error captured:', error.message);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a non-error message in Sentry (e.g. unexpected state, warnings).
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'warning'): void {
  if (!SENTRY_DSN) {
    console.warn(`[Sentry:disabled] Message (${level}):`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context so errors are associated with a specific user.
 * Call after successful authentication.
 */
export function setUserContext(userId: string, email?: string): void {
  Sentry.setUser({ id: userId, email: email ?? undefined });
}

/**
 * Clear user context on sign-out.
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add a breadcrumb for debugging context (e.g. navigation events, button taps).
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * Wrap the root React component with Sentry's performance monitoring wrapper.
 * Returns the wrapped component or the original if Sentry is disabled.
 */
export function wrapWithSentry<P extends Record<string, unknown>>(
  component: React.ComponentType<P>
): React.ComponentType<P> {
  if (!SENTRY_DSN) {
    return component;
  }
  return Sentry.wrap(component);
}
