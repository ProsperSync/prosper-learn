import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const effectiveDate = '2026-03-21';
  const contactEmail = 'danielelielgaio@gmail.com';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.termsOfService')}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.effectiveDate}>Effective Date: {effectiveDate}</Text>

        <Text style={styles.paragraph}>
          Welcome to Prosper Learn. By creating an account or using the Prosper Learn mobile
          application (the "App"), you agree to be bound by these Terms of Service ("Terms").
          Please read them carefully before using the App.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using the App, you acknowledge that you have read, understood, and
          agree to be bound by these Terms and our Privacy Policy. If you do not agree to these
          Terms, you may not use the App. We reserve the right to update or modify these Terms
          at any time, and your continued use of the App after any changes constitutes acceptance
          of the updated Terms.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Prosper Learn is a mobile application that provides financial education content,
          including lessons, quizzes, learning tracks, and gamification features (XP, badges,
          streaks). The App is designed to help users improve their financial literacy through
          structured, self-paced learning.
        </Text>
        <Text style={styles.importantNote}>
          IMPORTANT: Prosper Learn provides financial education only. The App is not a licensed
          financial advisor, broker, or planner. Nothing in the App constitutes personalized
          financial advice, investment recommendations, tax guidance, or legal counsel. You
          should consult a qualified professional before making any financial decisions. We are
          not responsible for any financial decisions you make based on the educational content
          provided in the App.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use the App, you must create an account using a valid email address and password.
          You are responsible for maintaining the confidentiality of your login credentials and
          for all activities that occur under your account. You agree to notify us immediately
          of any unauthorized use of your account.
        </Text>
        <Text style={styles.paragraph}>
          You must be at least 13 years of age to create an account. If you are under 18, you
          must have the consent of a parent or legal guardian to use the App.
        </Text>

        <Text style={styles.sectionTitle}>4. User Obligations</Text>
        <Text style={styles.paragraph}>
          When using the App, you agree to:
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Provide accurate and complete information when creating your account
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Use the App only for lawful purposes and in accordance with these Terms
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Not attempt to interfere with or disrupt the App's functionality or servers
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Not attempt to access other users' accounts or personal data
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Not reproduce, distribute, or create derivative works from the App's content
          without prior written permission
        </Text>

        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content in the App, including but not limited to lessons, quizzes, text, graphics,
          logos, and software, is the property of ProsperSync and is protected by intellectual
          property laws. You may not copy, modify, distribute, or create derivative works from
          the App's content without prior written consent.
        </Text>

        <Text style={styles.sectionTitle}>6. Account Termination</Text>
        <Text style={styles.paragraph}>
          You may delete your account at any time by contacting us at the email address provided
          below. Upon deletion, your personal data will be removed within 30 days in accordance
          with our Privacy Policy.
        </Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate your account at any time if we reasonably
          believe you have violated these Terms, engaged in fraudulent activity, or otherwise
          misused the App. We will make reasonable efforts to notify you before or at the time
          of such suspension or termination.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          The App and its content are provided "as is" and "as available" without warranties of
          any kind, either express or implied. ProsperSync does not warrant that the App will be
          uninterrupted, error-free, or free of harmful components.
        </Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by applicable law, ProsperSync and its affiliates,
          officers, employees, and agents shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages, including but not limited to loss of
          profits, data, or goodwill, arising out of or in connection with your use of the App.
        </Text>
        <Text style={styles.paragraph}>
          In particular, ProsperSync shall not be liable for any financial losses or damages
          resulting from actions you take based on the educational content provided in the App.
          The App provides general financial education and is not a substitute for professional
          financial advice.
        </Text>

        <Text style={styles.sectionTitle}>8. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the
          Federative Republic of Brazil, without regard to its conflict of law provisions. Any
          disputes arising from these Terms or your use of the App shall be resolved in the
          courts of Brazil.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to These Terms</Text>
        <Text style={styles.paragraph}>
          We may revise these Terms from time to time. We will notify you of material changes by
          posting the updated Terms within the App and updating the "Effective Date" above. Your
          continued use of the App after the revised Terms take effect constitutes your acceptance
          of the changes.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns about these Terms of Service, please contact us at:
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
  importantNote: {
    fontSize: 15,
    lineHeight: 24,
    color: '#D32F2F',
    backgroundColor: '#FFF8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD0D0',
    fontWeight: '500',
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
