import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { gamificationService } from '../../src/services';
import {
  areNotificationsEnabled,
  setNotificationsEnabled,
} from '../../src/lib/notifications/notificationService';

export default function ProfileTab() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [level, setLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const loadGamificationData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const stats = await gamificationService.getStats(user.id);
      if (stats) {
        setLevel(stats.currentLevel);
        setTotalXP(stats.totalXP);
      }
    } catch (error) {
      console.error('Failed to load profile stats:', error);
    }
  }, [user?.id]);

  const loadNotificationSetting = useCallback(async () => {
    try {
      const enabled = await areNotificationsEnabled();
      setNotificationsOn(enabled);
    } catch (error) {
      console.error('Failed to load notification setting:', error);
    }
  }, []);

  useEffect(() => {
    loadGamificationData();
    loadNotificationSetting();
  }, [loadGamificationData, loadNotificationSetting]);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsOn(value);
    try {
      await setNotificationsEnabled(value);
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      // Revert on failure
      setNotificationsOn(!value);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const displayEmail = user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        <Text style={styles.subtitle}>
          Level {level} • {totalXP.toLocaleString()} XP
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.language')}</Text>
          <Text style={styles.menuValue}>English</Text>
        </Pressable>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.notifications')}</Text>
          <Switch
            value={notificationsOn}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#ccc', true: '#81C784' }}
            thumbColor={notificationsOn ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.about')}</Text>
          <Text style={styles.menuValue}>v1.0.0</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.legal')}</Text>
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/privacy-policy')}
        >
          <Text style={styles.menuText}>{t('profile.privacyPolicy')}</Text>
          <Text style={styles.menuChevron}>{'\u2192'}</Text>
        </Pressable>
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/terms-of-service')}
        >
          <Text style={styles.menuText}>{t('profile.termsOfService')}</Text>
          <Text style={styles.menuChevron}>{'\u2192'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16 },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  email: { fontSize: 14, color: '#999', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: { fontSize: 16, color: '#333' },
  menuValue: { fontSize: 16, color: '#999' },
  menuChevron: { fontSize: 16, color: '#ccc' },
  signOutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});
