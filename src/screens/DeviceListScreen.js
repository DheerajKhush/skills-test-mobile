import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDevices } from '../hooks/useDevices';
import DeviceCard from '../components/DeviceCard';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import SyncStatus from '../components/SyncStatus';

/**
 * DeviceListScreen
 *
 * Displays list of IoT devices with offline-first caching and background sync.
 *
 * Features:
 * 1. Proper pull-to-refresh that awaits the fetch
 * 2. Throttled focus-based fetch (no refetch within 30 seconds)
 * 3. Memoized onPress callback
 * 4. Integrated SyncStatus indicator
 * 5. Graceful offline handling with cached data
 */
export default function DeviceListScreen({ navigation }) {
  const {
    devices,
    isLoading,
    isSyncing,
    error,
    syncStatus,
    lastSyncedAt,
    isStaleCacheOnError,
    fetchDevices,
    refresh,
  } = useDevices();
  const [refreshing, setRefreshing] = useState(false);

  // Track last focus time to implement throttle
  const lastFocusTimeRef = useRef(Date.now());
  const FOCUS_THROTTLE_MS = 30 * 1000; // 30 seconds

  // Wire up focus event with throttle
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFocusTimeRef.current > FOCUS_THROTTLE_MS) {
        lastFocusTimeRef.current = now;
        fetchDevices();
      }
    }, [fetchDevices])
  );

  // Handle pull-to-refresh — properly await the refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // Memoized callback — stable reference, no unnecessary re-renders of DeviceCard
  const handleDevicePress = useCallback(
    (device) => {
      navigation.navigate('DeviceDetail', { deviceId: device.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => <DeviceCard device={item} onPress={handleDevicePress} />,
    [handleDevicePress]
  );

  // ListHeaderComponent must be useCallback reference, not inline JSX
  const renderListHeader = useCallback(
    () => (
      <SyncStatus
        status={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onRetry={refresh}
        isStale={isStaleCacheOnError && syncStatus === 'error'}
      />
    ),
    [syncStatus, lastSyncedAt, refresh, isStaleCacheOnError]
  );

  // ListEmptyComponent must be useCallback reference, not inline JSX
  const renderEmptyComponent = useCallback(
    () => (
      <EmptyState
        message={
          devices.length === 0 && syncStatus === 'offline'
            ? "You're offline and there's no cached data"
            : 'No devices found'
        }
      />
    ),
    [devices.length, syncStatus]
  );

  const keyExtractor = (item) => item.id;

  // First load with no cache — show full-screen loading
  if (isLoading && devices.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading devices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && !isSyncing && (
        <ErrorBanner message={error} onRetry={refresh} />
      )}

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          devices.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0066CC']}
            tintColor="#0066CC"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
