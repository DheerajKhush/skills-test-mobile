import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * SyncStatus — Displays sync state and last sync time
 *
 * Props:
 *   status: 'syncing' | 'synced' | 'error' | 'offline'  (or null to hide)
 *   lastSyncedAt: number | null  (Date.now() timestamp of last successful sync)
 *   onRetry: () => void          (called when user taps error state)
 *
 * Shows relative time ("3 min ago") that updates every 30 seconds.
 */
export default function SyncStatus({ status, lastSyncedAt, onRetry, isStale = false }) {
  const [relativeTime, setRelativeTime] = useState(() =>
    lastSyncedAt ? getRelativeTime(lastSyncedAt) : null
  );

  // Update relative time every 30 seconds
  useEffect(() => {
    if (!lastSyncedAt || status !== 'synced') {
      return;
    }

    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(lastSyncedAt));
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [lastSyncedAt, status]);

  // Hide if no status
  if (!status) {
    return null;
  }

  // Syncing state
  if (status === 'syncing') {
    return (
      <View style={[styles.container, styles.syncingContainer]}>
        <ActivityIndicator size="small" color="#0066CC" style={styles.indicator} />
        <Text style={styles.syncingText}>Syncing...</Text>
      </View>
    );
  }

  // Synced state
  if (status === 'synced' && lastSyncedAt) {
    return (
      <View style={[styles.container, styles.syncedContainer]}>
        <Text style={styles.syncedText}>
          Updated {relativeTime}
        </Text>
      </View>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <TouchableOpacity
        style={[styles.container, styles.errorContainer]}
        onPress={onRetry}
      >
        <Text style={styles.errorText}>
          {isStale
            ? 'Sync failed — data may be outdated — tap to retry'
            : 'Sync failed — tap to retry'}
        </Text>
      </TouchableOpacity>
    );
  }

  // Offline state
  if (status === 'offline') {
    return (
      <View style={[styles.container, styles.offlineContainer]}>
        <Text style={styles.offlineText}>
          Offline — showing cached data
        </Text>
      </View>
    );
  }

  return null;
}

function getRelativeTime(timestamp) {
  if (!timestamp) return null;
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins === 0) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    minHeight: 40,
    justifyContent: 'center',
  },
  syncingContainer: {
    backgroundColor: '#EBF3FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    marginRight: 8,
  },
  syncingText: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '500',
  },
  syncedContainer: {
    backgroundColor: '#F0FDF4',
  },
  syncedText: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  offlineContainer: {
    backgroundColor: '#FEF3C7',
  },
  offlineText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500',
  },
});
