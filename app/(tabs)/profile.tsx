import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

export default function ProfileTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Learner</Text>
        <Text style={styles.subtitle}>Level 1 • 0 XP</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Language</Text>
          <Text style={styles.menuValue}>English</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuValue}>On</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>About</Text>
          <Text style={styles.menuValue}>v1.0.0</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16 },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  section: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { fontSize: 16, color: '#333' },
  menuValue: { fontSize: 16, color: '#999' },
});