import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { EducationalTrackSummary } from '../../lib/types';

interface TrackCardProps {
  track: EducationalTrackSummary;
  onPress: (track: EducationalTrackSummary) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(track)} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{track.title}</Text>
          <View style={[styles.badge, { backgroundColor: getDifficultyColor(track.difficulty) }]}>
            <Text style={styles.badgeText}>{track.difficulty}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{track.description}</Text>
        
        <View style={styles.stats}>
          <Text style={styles.statText}>{track.completedModules}/{track.totalModules} Modules</Text>
          <Text style={styles.statText}>{track.estimatedDurationHours}h</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${track.progressPercentage}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '#4CAF50';
    case 'intermediate': return '#FF9800';
    case 'advanced': return '#F44336';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
});
