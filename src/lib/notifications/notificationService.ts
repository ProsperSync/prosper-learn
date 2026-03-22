import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const STREAK_REMINDER_IDENTIFIER = 'daily-streak-reminder';

/**
 * Configure default notification behavior (show alert, sound, badge when app is in foreground).
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if permission was granted, false otherwise.
 * On Android 13+ (API 33), this triggers the runtime permission dialog.
 * On older Android, notifications are enabled by default.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Notifications only work on physical devices
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications require a physical device.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  const granted = status === 'granted';

  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, granted ? 'true' : 'false');

  // Set up the Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('streak-reminders', {
      name: 'Streak Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });
  }

  return granted;
}

/**
 * Schedule a daily streak reminder notification at the specified local time.
 * Defaults to 20:00 (8 PM) if no arguments are provided.
 * Cancels any previously scheduled streak reminder before scheduling a new one.
 */
export async function scheduleDailyStreakReminder(
  hour: number = 20,
  minute: number = 0
): Promise<void> {
  // Cancel existing reminder first to avoid duplicates
  await cancelAllStreakReminders();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your streak is waiting!',
      body: 'Open Prosper Learn to keep your learning streak alive.',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'streak-reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
    identifier: STREAK_REMINDER_IDENTIFIER,
  });
}

/**
 * Cancel all scheduled streak reminder notifications.
 */
export async function cancelAllStreakReminders(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_IDENTIFIER);
  } catch {
    // If the notification doesn't exist, cancelScheduledNotificationAsync may throw — ignore.
  }
}

/**
 * Send a local notification when a user unlocks a badge.
 */
export async function sendBadgeUnlockNotification(badgeName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Badge Unlocked!',
      body: `Congratulations! You earned the "${badgeName}" badge.`,
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'streak-reminders' }),
    },
    trigger: null, // Fire immediately
  });
}

/**
 * Check whether the user has enabled notifications in app settings.
 * Returns true if enabled (or if the key has never been set — default to enabled).
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  // Default to true if never set (user hasn't toggled off)
  return value !== 'false';
}

/**
 * Persist the user's notification preference and schedule/cancel reminders accordingly.
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');

  if (enabled) {
    await scheduleDailyStreakReminder();
  } else {
    await cancelAllStreakReminders();
  }
}
