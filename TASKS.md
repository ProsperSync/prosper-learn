# TASKS
_Last updated: 2026-03-21 | Executor Run #10_

---

## Active Tasks

---

### TASK-003
- **id**: TASK-003
- **title**: Google Play Store Submission Preparation
- **description**: The app is not ready for Play Store submission. Critical gaps include: no `targetSdkVersion` in `app.json` (Google mandates SDK 34+ as of 2024), no privacy policy URL (required because the app uses Supabase Auth + user data), no `eas.json` build configuration file (no way to produce a signed AAB for submission), and store listing assets are missing (screenshots, short/long description, feature graphic). Resolving this is the final gate before real users can be acquired.
- **domain**: Google Play Store Readiness / Legal & Trust / Mobile Release Readiness
- **priority**: P1
- **status**: TODO
- **dependencies**: TASK-002 ✅, TASK-007 (branded assets required before screenshots)
- **acceptance_criteria**:
  - `app.json` includes `android.targetSdkVersion: 34` and `android.versionCode: 1`
  - A privacy policy page exists (hosted HTML or in-app screen) covering: email/password collected via Supabase Auth, learning progress stored locally via AsyncStorage, no third-party ad data sharing
  - Privacy policy URL referenced in `app.json` under `android.privacyPolicy`
  - `eas.json` is created with `production` build profile (release AAB, proper signing config)
  - Store listing draft prepared: title "Prosper Learn", short description (≤80 chars), full description with keywords (financial education, personal finance, budgeting, investing, money management)
  - At least 4 screenshots covering key screens (Auth, Learn tab with tracks, Track Detail, Achievements)
  - Content rating questionnaire completed in Play Console

---

---

### TASK-007
- **id**: TASK-007
- **title**: Create Custom Branded App Icon & Splash Screen
- **description**: The current `assets/icon.png`, `assets/adaptive-icon.png`, and `assets/splash.png` are default Expo placeholders (white background, generic icon). Submitting these to the Play Store would immediately signal an unpolished app and is likely to result in rejection or low conversion. Custom branded assets must be created before Play Store screenshots can be taken (TASK-003 depends on this). The brand colors are green (#4CAF50 primary, consistent throughout the app UI). The icon should be a simple, memorable logomark that communicates "learning + financial growth" — e.g., a stylized book combined with an upward arrow or currency symbol. The splash screen should use the brand green background with the Prosper Learn wordmark centered. Assets required: `icon.png` (1024×1024 PNG), `adaptive-icon.png` foreground (1024×1024 PNG, transparent background), `splash.png` (1242×2436 PNG). All assets must be saved in the `assets/` folder and referenced correctly in `app.json`.
- **domain**: Google Play Store Readiness / Product & UX
- **priority**: P1
- **status**: TODO
- **dependencies**: none
- **acceptance_criteria**:
  - `assets/icon.png` is a custom branded 1024×1024 PNG (not default Expo white square)
  - `assets/adaptive-icon.png` is a custom branded foreground icon (1024×1024, transparent BG) for Android adaptive icons
  - `assets/splash.png` displays the Prosper Learn wordmark/logo on brand-colored background
  - `app.json` `splash.backgroundColor` matches brand green (#4CAF50 or close equivalent)
  - Icons are visually consistent with the app's green color scheme and financial education theme
  - No Expo default assets remain in use

---

---

### TASK-010
- **id**: TASK-010
- **title**: Integrate Sentry for Crash Reporting & Observability
- **description**: The app currently has zero observability. Once real users are using it, there is no way to know what is crashing, how often, or for which users. Sentry React Native provides automatic unhandled exception capture, breadcrumbs, user context, and performance monitoring. Setup steps: (1) install `@sentry/react-native` via npm, (2) initialize Sentry in `app/_layout.tsx` with the Sentry DSN (use environment variable `EXPO_PUBLIC_SENTRY_DSN`), (3) wrap the root component with `Sentry.wrap()`, (4) add `sentry-expo` plugin to `app.json` plugins array for source map uploads, (5) integrate with the ErrorBoundary from TASK-009 to report caught errors. This is a P2 task (not blocking launch) but should be done before or immediately after first Play Store upload, as it dramatically shortens the feedback loop for real-world crashes.
- **domain**: Analytics & Observability
- **priority**: P2
- **status**: TODO
- **dependencies**: TASK-009 ✅
- **acceptance_criteria**:
  - `@sentry/react-native` is installed and listed in `package.json` dependencies
  - Sentry is initialized in `app/_layout.tsx` before any UI renders, using `EXPO_PUBLIC_SENTRY_DSN` env var
  - Unhandled JS exceptions are automatically captured and visible in Sentry dashboard
  - The `ErrorBoundary` (TASK-009) calls `Sentry.captureException(error)` in `componentDidCatch`
  - `app.json` includes `sentry-expo` plugin for source map uploads on EAS Build
  - A test throw in development can be verified in the Sentry dashboard

---

## Completed Tasks

---

### TASK-006 ✅
- **id**: TASK-006
- **title**: Implement User Onboarding Flow
- **completed**: 2026-03-21 (Executor Run #10)
- **summary**: Created `src/screens/OnboardingScreen.tsx` — a 3-screen horizontal-swipe onboarding flow: (1) Welcome screen with value proposition and feature highlights (lessons, XP, badges), (2) Track system explainer with a visual demo card, (3) Category picker where users choose their first learning topic. Onboarding is gated by `AsyncStorage` key `onboarding_complete` — only shown on first login. Users can skip at any time via a "Skip" button. Completing or skipping sets the flag and redirects to the Education tab. Created `app/onboarding/index.tsx` route. Updated `app/_layout.tsx` `AuthGate` to check onboarding status and redirect authenticated users who haven't completed onboarding. Full i18n support (EN + pt-BR). Zero new TypeScript errors.

---

### TASK-009 ✅
- **id**: TASK-009
- **title**: Add Global React Error Boundary
- **completed**: 2026-03-21 (Executor Run #9)
- **summary**: Created `src/components/ErrorBoundary.tsx` — a React class component implementing `getDerivedStateFromError` and `componentDidCatch`. Fallback UI displays an error emoji, "Something went wrong" title, descriptive message reassuring data safety, and a green "Try Again" button that resets state to re-render children. In dev mode, error details are shown in a styled card. Errors are logged to console (ready for Sentry integration in TASK-010). Wrapped `<AuthProvider>` and `<AuthGate>` with `<ErrorBoundary>` in `app/_layout.tsx` so the boundary catches any render-phase error in the entire component tree. Zero new TypeScript errors.

---

### TASK-008 ✅
- **id**: TASK-008
- **title**: Auto-Update Daily Learning Streak on Lesson Completion
- **completed**: 2026-03-21 (Executor Run #8)
- **summary**: Wired the daily learning streak into the lesson completion handler in `app/lesson/[id].tsx`. Added an `updateDailyStreak()` function that uses `date-fns` (`format`, `isToday`, `isYesterday`, `parseISO`) to manage the `educational` streak type. On lesson completion: if no streak exists, creates one with `currentStreak: 1`; if already incremented today, does nothing (idempotent); if last activity was yesterday, increments `currentStreak`; if older, resets to 1 (streak broken). `longestStreak` is updated whenever `currentStreak` exceeds it. Milestones (3, 7, 14, 30 days) are tracked and marked when reached. The streak is visible in `GamificationScreen` via the existing `StreakList` widget. Zero new TypeScript errors.

---

### TASK-002 ✅
- **id**: TASK-002
- **title**: Build Track Detail Screen & Wire into Route
- **completed**: 2026-03-21 (Executor Run #7)
- **summary**: Created `src/screens/TrackDetailScreen.tsx` — a full Track Detail screen that receives `trackId`, loads track metadata via `educationalTrackEngine.getTrack()` and lessons via `getTrackLessons()`, and renders: track title with difficulty badge, description, stats row (lesson count, total XP, estimated time), progress bar with completion percentage and XP earned, and a scrollable lesson list. Each lesson card shows order number (or ✓ checkmark if completed), title, description, type badge (article/quiz/video/interactive/challenge with color coding), duration, XP reward, and in-progress indicator dot. Tapping a lesson navigates to `/lesson/${lesson.id}`. Back arrow returns to the track list. Graceful error state for invalid track IDs. Pull-to-refresh support. Updated `app/track/[id].tsx` to import and render `TrackDetailScreen` instead of `EducationalTrackScreen`. Zero new TypeScript errors. The full user journey Auth → Track List → Track Detail → Lesson → Complete → XP is now end-to-end functional.

---

### TASK-005 ✅
- **id**: TASK-005
- **title**: Implement Lesson Screen Content Rendering
- **completed**: 2026-03-21 (Executor Run #4)
- **summary**: Fully implemented `app/lesson/[id].tsx` with complete lesson content rendering. Added `getLessonById()` method to `EducationalTrackEngine` for direct lesson lookup without requiring trackId. The LessonScreen now supports: article-type lessons (renders title, description, and body text), quiz-type lessons (renders questions with multiple-choice options, answer selection, submission, score feedback with pass/fail at 70%, per-question explanations), video/interactive/challenge types (content body rendering with type indicators). Lesson completion calls `educationalService.completeLesson()` and `educationalService.startLesson()`. XP is awarded via `gamificationService.saveXPEvent()` + `saveUserXP()` with bonus XP for quiz pass and perfect scores. Success shown via animated toast overlay. Graceful error state for invalid lesson IDs. Zero new TypeScript errors.

---

### TASK-004 ✅
- **id**: TASK-004
- **title**: Fix Navigation Bug in EducationalTrackScreen (expo-router vs React Navigation)
- **completed**: 2026-03-21 (Executor Run #3)
- **summary**: Fixed the navigation API mismatch in `EducationalTrackScreen.tsx`. Replaced React Navigation's `navigation.navigate('TrackDetail', { trackId: track.id })` with expo-router's `router.push('/track/' + track.id)`. Removed the `{ navigation }: any` prop, added `useRouter` import from `expo-router`, and initialized `const router = useRouter()`. No references to `navigation` remain in the file. TypeScript compilation passes (all errors are pre-existing in node_modules).

---

### TASK-001 ✅
- **id**: TASK-001
- **title**: Implement User Authentication Flow
- **completed**: 2026-03-21 (Run #2 assessment)
- **summary**: Fully implemented. `useAuth.tsx` hook provides `signIn`, `signUp`, `signOut`, `user`, `session`, and `loading`. `AuthProvider` wraps the app in `_layout.tsx`. `AuthGate` component handles routing: unauthenticated users are redirected to `/auth`, authenticated users are redirected away from auth screen. `AuthScreen` (`app/auth/index.tsx`) is fully implemented with email/password forms, validation, error handling, and i18n. Hardcoded `'current-user-id'` replaced with `user?.id ?? ''` in `GamificationScreen`, `EducationalTrackScreen`, and `ProfileTab`. Profile tab displays real user email, name, level, and XP from the gamification service.

---

## Notes

### Session #6 — 2026-03-21 (Planner Run)

**Assessed Stage**: MVP — Near-complete. `TrackDetailScreen.tsx` is fully implemented (lesson list with progress tracking, difficulty badge, XP stats, back nav, error state). The ONLY remaining P0 gap is that `app/track/[id].tsx` still imports `EducationalTrackScreen` rather than the new `TrackDetailScreen`. One import swap = full MVP loop functional.

**Progress Since Run #5**:
- `src/screens/TrackDetailScreen.tsx` has been fully created and implemented by the executor — all acceptance criteria met at the component level
- TASK-002 remains TODO only because the route file (`app/track/[id].tsx`) hasn't been updated to use it yet
- Streak service, XP, badges, and gamification screens all exist — but streak is not auto-updated on lesson completion (new TASK-008)
- No error boundary exists anywhere in the app (new TASK-009)
- No crash reporting or observability tooling (new TASK-010)

**Tasks Added This Run**:
- TASK-002: Updated description to reflect new state — component is done, only 2-line route wiring remains
- TASK-008: Auto-Update Daily Learning Streak on Lesson Completion (P1)
- TASK-009: Add Global React Error Boundary (P1)
- TASK-010: Integrate Sentry for Crash Reporting (P2)

**Critical Path to Launch**:
1. TASK-002 — Route wiring (P0, ~5 min change, unblocks full user journey)
2. TASK-007 — Branded app icon & splash (P1, prerequisite for screenshots)
3. TASK-008 — Streak auto-update (P1, Day-2+ retention mechanic)
4. TASK-009 — Error boundary (P1, production safety)
5. TASK-006 — User onboarding (P1, Day 1 conversion)
6. TASK-003 — Play Store prep (P1, final gate to real users)
7. TASK-010 — Sentry (P2, post-launch observability)

**Deferred to Future Runs**:
- Push notifications for streak reminders (P2) — notify users when streak is at risk
- CI/CD pipeline — GitHub Actions + EAS Build (P2)
- Monetization model — not yet determined
- Landing page / web presence (P2)
- Language switcher in Profile settings (P2)
- Terms of Service screen (P2, companion to privacy policy)
- App Store Optimization research (P2, keyword targeting for Play Store listing)
