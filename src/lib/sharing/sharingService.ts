import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share } from 'react-native';

/**
 * Checks whether the native share sheet is available on the current platform.
 */
export async function isSharingAvailable(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}

/**
 * Opens the native share dialog with a pre-composed achievement message.
 *
 * @param achievementTitle - The display name of the earned badge or completed track.
 * @param message - Optional custom message. If omitted, a default message is generated.
 */
export async function shareAchievement(
  achievementTitle: string,
  message?: string,
): Promise<void> {
  const available = await isSharingAvailable();

  if (!available) {
    Alert.alert(
      'Sharing Unavailable',
      'Sharing is not supported on this device.',
    );
    return;
  }

  // expo-sharing's shareAsync requires a local file URI, so for text-only
  // sharing we use React Native's built-in Share API which supports plain text.
  // expo-sharing is still used for the availability check above.
  const shareMessage =
    message ??
    `I just earned the "${achievementTitle}" badge on Prosper Learn! Learning personal finance one lesson at a time. #ProsperLearn`;

  try {
    await Share.share(
      Platform.OS === 'ios'
        ? { message: shareMessage }
        : { message: shareMessage, title: 'Prosper Learn Achievement' },
    );
  } catch (error: unknown) {
    // User cancelled sharing — not an error
    if (error instanceof Error && error.message === 'User did not share') {
      return;
    }
    console.error('Failed to share achievement:', error);
  }
}

/**
 * Shares a lesson completion message via the native share sheet.
 *
 * @param lessonTitle - The title of the completed lesson.
 * @param earnedXP - The XP earned from the lesson.
 */
export async function shareLessonCompletion(
  lessonTitle: string,
  earnedXP: number,
): Promise<void> {
  const message = `I just completed "${lessonTitle}" and earned ${earnedXP} XP on Prosper Learn! #ProsperLearn #FinancialLiteracy`;
  await shareAchievement(lessonTitle, message);
}
