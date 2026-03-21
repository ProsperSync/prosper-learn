import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TrackDetailScreen } from '../../src/screens/TrackDetailScreen';

export default function TrackDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TrackDetailScreen trackId={id || ''} />;
}
