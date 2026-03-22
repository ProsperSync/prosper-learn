import React, { useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { TrackList } from '../components/education/TrackList';
import { EducationalTrackSummary } from '../lib/types';
import { trackTrackSelected } from '../lib/analytics/analyticsService';

// Mock data
const MOCK_TRACKS: EducationalTrackSummary[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Financial Basics',
    description: 'Learn the fundamentals of personal finance, budgeting, and saving.',
    difficulty: 'beginner',
    totalModules: 5,
    completedModules: 2,
    progressPercentage: 40,
    estimatedDurationHours: 3,
    tags: ['basics', 'saving'],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Investing 101',
    description: 'Start your journey into the world of stocks, bonds, and ETFs.',
    difficulty: 'intermediate',
    totalModules: 8,
    completedModules: 0,
    progressPercentage: 0,
    estimatedDurationHours: 6,
    tags: ['investing', 'stocks'],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    title: 'Advanced Tax Strategies',
    description: 'Optimize your tax situation with advanced strategies for investors.',
    difficulty: 'advanced',
    totalModules: 4,
    completedModules: 4,
    progressPercentage: 100,
    estimatedDurationHours: 4,
    tags: ['taxes', 'advanced'],
  },
];

export const EducationScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch real data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTrackPress = (track: EducationalTrackSummary) => {
    console.log('Track pressed:', track.title);
    trackTrackSelected(track.id, track.difficulty);
    // TODO: Navigate to track detail
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TrackList tracks={MOCK_TRACKS} onTrackPress={handleTrackPress} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
});
