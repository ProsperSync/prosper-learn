import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_REQUESTED_KEY = 'review_requested';
const LESSONS_THRESHOLD = 5;

/**
 * Prompts the user for an in-app review after completing their 5th lesson.
 * The prompt is shown at most once per install (persisted via AsyncStorage).
 *
 * @param lessonsCompleted - The total number of lessons the user has completed.
 */
export async function maybeRequestReview(lessonsCompleted: number): Promise<void> {
  try {
    // Only prompt after reaching the milestone
    if (lessonsCompleted < LESSONS_THRESHOLD) {
      return;
    }

    // Never prompt more than once per install
    const alreadyRequested = await AsyncStorage.getItem(REVIEW_REQUESTED_KEY);
    if (alreadyRequested === 'true') {
      return;
    }

    // Check if the device supports in-app review
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return;
    }

    // Request the review — this is non-blocking and the OS controls the UI
    await StoreReview.requestReview();

    // Mark as requested so it never fires again
    await AsyncStorage.setItem(REVIEW_REQUESTED_KEY, 'true');
  } catch {
    // Silently fail — review prompt is non-critical
  }
}
