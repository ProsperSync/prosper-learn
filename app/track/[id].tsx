import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { EducationalTrackScreen } from '../../src/screens/EducationalTrackScreen';

export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EducationalTrackScreen trackId={id} />;
}