# TASKS
_Last updated: 2026-03-21 | Planner Run #13_

---

## Active Tasks

---

---

### TASK-016
- **id**: TASK-016
- **title**: Create App Landing Page on GitHub Pages (Privacy Policy Host)
- **description**: PRIORITY ESCALATED FROM P3 → P1. This is now a prerequisite for TASK-003. Google Play Console requires a publicly accessible URL for the privacy policy — the in-app `PrivacyPolicyScreen` is not sufficient. TASK-016 must be completed BEFORE TASK-003 can be fully executed. The page should be a single `index.html` file in a `/docs` folder at the repo root (GitHub Pages standard). Content: (1) hero section with "Prosper Learn" name + tagline, (2) brief feature overview, (3) embedded or linked Privacy Policy (copy text from `src/screens/PrivacyPolicyScreen.tsx`), (4) Terms of Service link (can be placeholder URL until TASK-014 is done), (5) contact email. After GitHub Pages is enabled in repo settings (`Settings → Pages → Source: /docs branch: main`), the URL `https://<username>.github.io/<repo>/` becomes the canonical privacy policy host. Document the final URL in `PROGRESS.md` and add it to `app.json` as `expo.extra.privacyPolicyUrl`.
- **domain**: Growth & Marketing / Legal & Trust
- **priority**: P1
- **status**: TODO
- **dependencies**: TASK-012 ✅
- **acceptance_criteria**:
  - A `docs/index.html` file exists at the repo root with app name "Prosper Learn", tagline, and feature overview (3+ features)
  - Privacy Policy text is embedded on the page (or at `/docs/privacy-policy.html` linked from the main page)
  - The page is mobile-responsive (meta viewport tag set, readable on phone)
  - GitHub Pages is configured and the page is publicly accessible at a stable `github.io` URL
  - The privacy policy URL is documented in `PROGRESS.md`
  - The URL is added to `app.json` under `expo.extra.privacyPolicyUrl`
  - Page does not require any backend — pure static HTML/CSS

---

---

### TASK-003
- **id**: TASK-003
- **title**: Google Play Store Submission Preparation
- **description**: PRIORITY ESCALATED TO P0. All engineering and legal dependencies are now complete (TASK-007 ✅ branded icon, TASK-011 ✅ eas.json, TASK-012 ✅ privacy policy screen, TASK-013 ✅ app.json compliance). The only remaining dependency before this task can be fully executed is TASK-016 (GitHub Pages landing page) which provides the hosted privacy policy URL required by Play Console. Once TASK-016 is done, this task is the final gate to real users. Steps: (1) run `eas build --platform android --profile production` to generate the signed AAB, (2) complete the Play Console listing: title "Prosper Learn", short description ≤80 chars, full description with keywords (financial education, personal finance, budgeting, investing, money management), (3) enter the hosted privacy policy URL from TASK-016 into Play Console, (4) upload at least 4 screenshots covering Auth, Learn tab with tracks, Track Detail, and Achievements/Gamification screens, (5) complete content rating questionnaire, (6) upload the AAB and submit for review.
- **domain**: Google Play Store Readiness / Legal & Trust / Mobile Release Readiness
- **priority**: P0
- **status**: TODO
- **dependencies**: TASK-007 ✅, TASK-011 ✅, TASK-012 ✅, TASK-013 ✅, TASK-016
- **acceptance_criteria**:
  - `eas build --platform android --profile production` completes and produces a valid signed AAB
  - Store listing draft completed in Play Console: title "Prosper Learn", short description (≤80 chars), full description with keywords (financial education, personal finance, budgeting, investing, money management)
  - At least 4 screenshots covering key screens (Auth, Learn tab with tracks, Track Detail, Achievements)
  - Content rating questionnaire completed in Play Console
  - Privacy policy URL (from TASK-016) entered in Play Console listing
  - App submitted for review

---

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

### TASK-014 ✅ _(moved to Completed Tasks)_

---

---

### TASK-015
- **id**: TASK-015
- **title**: Implement Push Notifications for Streak Reminders
- **description**: Day-2 retention is the most critical metric for any education app — if users don't return the next day, they almost certainly never will. Push notifications for streak reminders are the highest-ROI retention tool available. The app already has a full streak system (TASK-008 ✅) but there is no mechanism to remind users to maintain their streak. Steps: (1) install `expo-notifications` and `expo-device`, (2) create `src/lib/notifications/notificationService.ts` with functions: `requestNotificationPermissions()`, `scheduleDailyStreakReminder(hour: number, minute: number)`, `cancelAllStreakReminders()`, `sendBadgeUnlockNotification(badgeName: string)`, (3) request notification permissions during onboarding (screen 3 or post-completion), with clear explanation of what notifications will be sent, (4) schedule a daily reminder at 8 PM local time if user hasn't completed a lesson that day, (5) add Notifications settings toggle in Profile tab allowing users to enable/disable, (6) add `expo-notifications` plugin to `app.json` plugins array.
- **domain**: Product & UX / Analytics & Observability
- **priority**: P2
- **status**: TODO
- **dependencies**: TASK-006 ✅, TASK-008 ✅
- **acceptance_criteria**:
  - `expo-notifications` is installed and listed in `package.json` dependencies
  - `src/lib/notifications/notificationService.ts` exports `requestNotificationPermissions`, `scheduleDailyStreakReminder`, `cancelAllStreakReminders`
  - Notification permission is requested at the end of onboarding or after first lesson completion (not on cold launch)
  - A daily streak reminder is scheduled for 8 PM local time using `Notifications.scheduleNotificationAsync` with a daily trigger
  - Notification title/body is personalized (e.g. "🔥 Your streak is waiting! Open Prosper Learn to keep it alive.")
  - Profile settings tab includes a toggle to enable/disable notifications, persisted to AsyncStorage
  - `app.json` includes `expo-notifications` in the plugins array

---

---

### TASK-017
- **id**: TASK-017
- **title**: Add In-App Rating Prompt After Milestone Completion
- **description**: Play Store ratings are one of the strongest organic growth levers for app discovery. After a user has had enough positive experience to form a genuine opinion — completing their 5th lesson is a natural milestone — prompt them to rate the app using the native in-app review API. This avoids the jarring experience of a cold rating request and maximizes the likelihood of a positive review. Steps: (1) install `expo-store-review`, (2) create `src/lib/reviews/reviewService.ts` with function `maybeRequestReview(lessonsCompleted: number)` that checks if `lessonsCompleted >= 5`, if `expo-store-review` is available (`StoreReview.isAvailableAsync()`), and if the prompt hasn't been shown before (persisted in AsyncStorage key `review_requested`), then calls `StoreReview.requestReview()` and sets the flag, (3) call `maybeRequestReview()` in the lesson completion handler in `app/lesson/[id].tsx` after the XP is awarded and toast is shown, (4) the rating prompt must NEVER be shown more than once per install (enforced via the AsyncStorage flag).
- **domain**: Growth & Marketing / Product & UX
- **priority**: P2
- **status**: TODO
- **dependencies**: TASK-003
- **acceptance_criteria**:
  - `expo-store-review` is installed and listed in `package.json` dependencies
  - `src/lib/reviews/reviewService.ts` exports `maybeRequestReview(lessonsCompleted: number)`
  - The review prompt fires after the user's 5th lesson completion (not before)
  - The prompt is shown at most once per install (AsyncStorage flag `review_requested` prevents repeats)
  - `StoreReview.isAvailableAsync()` is checked before calling `requestReview()` to avoid crashes on unsupported devices
  - The prompt appears after the lesson completion toast (non-blocking, natural timing)
  - No crashes or TypeScript errors introduced

---

## Completed Tasks

---

### TASK-014 ✅
- **id**: TASK-014
- **title**: Add Terms of Service Screen
- **completed**: 2026-03-21 (Executor Run #14)
- **summary**: Created `src/screens/TermsOfServiceScreen.tsx` — a complete, scrollable Terms of Service covering: acceptance of terms, service description (educational content only, NOT financial advice — highlighted in a red notice box), user accounts (age 13+), user obligations, intellectual property, account termination, limitation of liability, governing law (Brazil), changes to terms, and contact info. Added `app/terms-of-service.tsx` route. Added "Terms of Service" pressable link in Profile tab Legal section alongside Privacy Policy. Added sign-up agreement text in `app/auth/index.tsx`: "By signing up, you agree to our Terms of Service and Privacy Policy" with tappable links to both screens (only shown in sign-up mode). Updated `_layout.tsx` to register the route and allow unauthenticated access. Full i18n support (EN + pt-BR). Zero new TypeScript errors.

---

### TASK-007 ✅
- **id**: TASK-007
- **title**: Create Custom Branded App Icon & Splash Screen
- **completed**: 2026-03-21 (Executor Run #13)
- **summary**: Generated custom branded assets using Python Pillow: `icon.png` (1024×1024, green background with white book+arrow logomark), `adaptive-icon.png` (1024×1024, transparent background with white logomark for Android adaptive icons), `splash.png` (1242×2436, green background with logomark + "Prosper Learn" wordmark + subtitle), and `favicon.png` (48×48 scaled icon). The logomark depicts an open book with text lines and an upward arrow emerging from it, symbolizing learning and financial growth. All assets use brand green (#4CAF50) and are consistent with the app's design language. `app.json` already correctly references all asset paths and has `splash.backgroundColor: "#4CAF50"`.

---

### TASK-012 ✅
- **id**: TASK-012
- **title**: Create Privacy Policy Screen & Hosted URL
- **completed**: 2026-03-21 (Executor Run #12)
- **summary**: Created `src/screens/PrivacyPolicyScreen.tsx` — a complete, scrollable privacy policy covering: data collected (email, display name), purpose (authentication + personalized learning), storage (Supabase cloud + AsyncStorage on-device), no third-party advertising, data security, deletion rights (30-day turnaround), children's privacy, and contact email. Added `app/privacy-policy.tsx` route. Added "Privacy Policy" pressable link in Profile tab under a new "Legal" settings section. Updated `_layout.tsx` to register the route and allow unauthenticated access. Added i18n translations (EN + pt-BR). Note: hosted URL pending TASK-016 (GitHub Pages landing page).

---

### TASK-011 ✅
- **id**: TASK-011
- **title**: Create `eas.json` Build Configuration for Production AAB
- **completed**: 2026-03-21 (Executor Run #11)
- **summary**: Created `eas.json` at repo root with three build profiles: `development` (developmentClient, internal distribution), `preview` (internal distribution, APK buildType for testing), and `production` (store distribution, app-bundle buildType for Play Store). Includes `submit.production.android` config for Play Store submission via service account. CLI version set to >= 12.0.0 with remote appVersionSource. Valid JSON confirmed.

---

### TASK-013 ✅
- **id**: TASK-013
- **title**: Update `app.json` for Play Store Compliance
- **completed**: 2026-03-21 (Executor Run #11)
- **summary**: Updated `app.json` with four Play Store compliance changes: (1) added `"targetSdkVersion": 34` to android block (required by Google Play since Aug 2024), (2) added `"versionCode": 1` to android block (required by Play Console), (3) changed `splash.backgroundColor` from `"#ffffff"` to `"#4CAF50"` (brand green), (4) changed `android.adaptiveIcon.backgroundColor` from `"#ffffff"` to `"#4CAF50"`. `android.package` remains `com.prospersync.learn`. Valid JSON confirmed.

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

### Planner Run #13 — 2026-03-21

**Assessed Stage**: Pre-release. **LAUNCH IS IMMINENT** — only two tasks stand between this app and real users: TASK-016 (GitHub Pages, hosts the privacy policy URL that Play Console requires) and TASK-003 (the Play Store submission itself).

**Key Findings**:
- TASK-007 ✅ (branded icon/splash), TASK-011 ✅ (eas.json), TASK-012 ✅ (privacy policy screen), TASK-013 ✅ (app.json compliance) — ALL DONE. Extraordinary progress.
- TASK-003 had a hidden dependency that was previously undetected: Play Console requires a **publicly hosted URL** for the privacy policy. The in-app `PrivacyPolicyScreen` alone is not sufficient. TASK-016 (GitHub Pages) solves this and must run BEFORE TASK-003.
- TASK-016 was previously P3 — this was a planning error. Escalated to **P1** and added as an explicit dependency of TASK-003.
- TASK-003 escalated from P1 → **P0**: once TASK-016 is done, this is the only thing separating the app from the Play Store.
- No `expo-notifications` or `@sentry/react-native` in `package.json` — TASK-015 and TASK-010 remain genuinely unstarted.
- `TermsOfServiceScreen.tsx` does not exist yet — TASK-014 remains genuinely unstarted.

**Tasks Added or Updated This Run**:
- TASK-016: **P3 → P1** (escalated — hosts privacy policy URL required by Play Console, now a prerequisite of TASK-003)
- TASK-003: **P1 → P0** (escalated — all deps now done except TASK-016, this IS the launch gate)
- TASK-017: **NEW** — In-App Rating Prompt After Milestone Completion (P2, post-launch growth)

**Immediate Critical Path to Launch**:
1. **TASK-016** (P1) — Create GitHub Pages landing page → provides the hosted privacy policy URL
2. **TASK-003** (P0) — Generate signed AAB + complete Play Console listing + submit for review

**Post-Launch Priority Queue**:
1. TASK-014 (P2) — Terms of Service Screen (legal completeness)
2. TASK-015 (P2) — Push Notifications for Streak Reminders (Day-2 retention)
3. TASK-010 (P2) — Sentry Crash Reporting (observability)
4. TASK-017 (P2) — In-App Rating Prompt (Play Store rating growth)

---

### Planner Run #11 — 2026-03-21

**Assessed Stage**: Pre-release. MVP + Onboarding fully complete. All engineering P0 tasks done. Focus is 100% on Play Store release infrastructure and legal requirements.

**Key Findings**:
- TASK-006 (Onboarding) was already completed by a prior executor run (confirmed from code review). `OnboardingScreen.tsx` is a fully-featured 3-page swipe flow with category picker, skip, and AsyncStorage persistence.
- `eas.json` is MISSING — absolute blocker for any signed production build. Added as TASK-011 (P0).
- `app.json` is missing `targetSdkVersion: 34` and `versionCode: 1`; splash/adaptiveIcon backgrounds are still `#ffffff` white. Added as TASK-013 (P0).
- No privacy policy exists anywhere — Play Store will reject submission without one. Added as TASK-012 (P1).
- TASK-003 was too broad; broken into TASK-011, TASK-012, TASK-013 sub-tasks. TASK-003 now represents the final integration step.

**Tasks Added This Run**:
- TASK-011: Create `eas.json` Build Configuration (P0)
- TASK-013: Update `app.json` compliance fields (P0)
- TASK-012: Create Privacy Policy Screen & Hosted URL (P1)

---

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
