import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { EducationalTrackSummary } from '../../lib/types';
import { TrackCard } from './TrackCard';

interface TrackListProps {
  tracks: EducationalTrackSummary[];
  onTrackPress: (track: EducationalTrackSummary) => void;
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, onTrackPress }) => {
  if (tracks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No educational tracks available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Learning Paths</Text>
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} onPress={onTrackPress} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
