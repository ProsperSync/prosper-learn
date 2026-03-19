import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Lesson</Text>
      <Text style={styles.subtitle}>Lesson ID: {id}</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Lesson content will be rendered here</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 24 },
  placeholder: { padding: 32, backgroundColor: '#F2F2F7', borderRadius: 12, alignItems: 'center' },
  placeholderText: { fontSize: 16, color: '#666' },
});