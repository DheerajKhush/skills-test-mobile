import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * SyncStatus — skeleton
 *
 * Implement this component as part of the offline-first feature.
 * See BRIEF.md → Feature → Sync status indicator.
 *
 * Props:
 *   status: 'syncing' | 'synced' | 'error' | 'offline'
 *   lastSyncedAt: number | null  (Date.now() timestamp of last successful sync)
 *   onRetry: () => void          (called when user taps error state)
 *
 * States to display:
 *   syncing  → "Syncing..." with activity indicator
 *   synced   → "Updated just now" or "Updated 3 min ago"
 *   error    → "Sync failed — tap to retry"
 *   offline  → "Offline — showing cached data"
 *
 * The relative time ("3 min ago") should update every 30 seconds.
 * Don't cause layout shift when transitioning between states.
 */

export default function SyncStatus({ status, lastSyncedAt, onRetry }) {
  // TODO: implement relative time tracking (update every 30s)
  // TODO: implement status-based rendering
  // TODO: implement offline detection (use @react-native-community/netinfo)

  // Placeholder — replace with real implementation
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        SyncStatus: {status} — implement me
      </Text>
    </View>
  );
}

function getRelativeTime(timestamp) {
  // TODO: implement
  // Returns a string like "just now", "3 min ago", "2 hours ago"
  if (!timestamp) return null;
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) !== 1 ? 's' : ''} ago`;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDD',
    minHeight: 36,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
