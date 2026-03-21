import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const effectiveDate = '2026-03-21';
  const contactEmail = 'danielelielgaio@gmail.com';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.privacyPolicy')}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.effectiveDate}>Effective Date: {effectiveDate}</Text>

        <Text style={styles.paragraph}>
          ProsperSync ("we", "our", or "us") operates the Prosper Learn mobile application
          (the "App"). This Privacy Policy explains how we collect, use, store, and protect
          your personal information when you use our App.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          When you create an account, we collect your email address and display name. This
          information is required to provide you with a personalized learning experience and
          to authenticate your identity.
        </Text>
        <Text style={styles.paragraph}>
          We also collect your learning progress data, including lessons completed, quiz scores,
          XP earned, badges unlocked, and streak information. This data is used to track your
          educational journey and provide personalized recommendations.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect for the following purposes:
        </Text>
        <Text style={styles.listItem}>
          • To create and manage your user account
        </Text>
        <Text style={styles.listItem}>
          • To provide personalized financial education content
        </Text>
        <Text style={styles.listItem}>
          • To track your learning progress, streaks, and achievements
        </Text>
        <Text style={styles.listItem}>
          • To improve our educational content and App features
        </Text>
        <Text style={styles.listItem}>
          • To communicate with you about your account or the App (e.g., password resets)
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage</Text>
        <Text style={styles.paragraph}>
          Your account information (email and display name) is stored securely in the cloud
          using Supabase, a secure database platform with encryption at rest and in transit.
        </Text>
        <Text style={styles.paragraph}>
          Your learning progress data (lesson completions, XP, badges, streaks) is stored
          on your device using AsyncStorage for offline access and fast performance. This data
          remains on your device unless you choose to sync it.
        </Text>

        <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use Supabase for authentication and cloud data storage. Supabase processes your
          email and password securely. You can review Supabase's privacy practices at
          https://supabase.com/privacy.
        </Text>
        <Text style={styles.paragraph}>
          We do not sell, rent, or share your personal information with third-party advertisers.
          We do not display advertisements in the App. We do not use your data for advertising
          purposes.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We take reasonable measures to protect your personal information from unauthorized
          access, alteration, disclosure, or destruction. These measures include encryption
          of data in transit (HTTPS/TLS), secure authentication via Supabase Auth, and
          on-device storage for sensitive learning data.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, correct, or delete your personal data at any time.
          You may request deletion of your account and all associated data by contacting us
          at the email address below. Upon receiving a deletion request, we will remove your
          account and personal data within 30 days.
        </Text>
        <Text style={styles.paragraph}>
          You can also delete your on-device learning progress data at any time by clearing
          the App's storage through your device settings.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          The App is not directed at children under the age of 13. We do not knowingly collect
          personal information from children under 13. If we become aware that we have collected
          personal data from a child under 13, we will take steps to delete that information
          promptly.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any
          material changes by posting the new Privacy Policy within the App and updating the
          "Effective Date" at the top. Your continued use of the App after any changes
          constitutes acceptance of the updated Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns about this Privacy Policy, or if you wish to
          exercise your data rights (access, correction, or deletion), please contact us at:
        </Text>
        <Text style={styles.contactEmail}>{contactEmail}</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
    marginBottom: 4,
    paddingLeft: 8,
  },
  contactEmail: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
