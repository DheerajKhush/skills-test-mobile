import React, { useState, useCallback } from 'react';
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
 * BUGS in this file:
 *
 * Bug 1 — Excessive re-renders:
 *   - useFocusEffect triggers fetchDevices on every focus event (no throttle)
 *   - onPress callback is recreated on every render (no useCallback)
 *   - Combined with unmemoized DeviceCard, this causes full list re-renders on tab switch
 *
 * Bug 2 — Pull-to-refresh stale state:
 *   - handleRefresh calls fetchDevices() but doesn't await it correctly
 *   - refreshing is set to false immediately, before fetch completes
 *   - List doesn't update after pull-to-refresh
 *
 * See BRIEF.md for full spec.
 */
export default function DeviceListScreen({ navigation }) {
  const { devices, isLoading, error, fetchDevices } = useDevices();
  const [refreshing, setRefreshing] = useState(false);

  // BUG: This runs fetchDevices on EVERY focus event — tab switches, back navigation, etc.
  // No throttle, no tracking of when we last fetched.
  // Fix: track lastFetchedAt, skip if < 30 seconds ago.
  useFocusEffect(
    useCallback(() => {
      fetchDevices();
    }, [fetchDevices])
  );

  // BUG: This doesn't work.
  // fetchDevices() is called but not awaited — setRefreshing(false) runs immediately.
  // The list state updates from fetchDevices don't arrive until after refreshing is already false.
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDevices(); // ← should be awaited, and should force-bypass throttle
    setRefreshing(false);
  };

  // BUG: This callback is recreated on every render.
  // Every DeviceCard receives a new onPress reference, causing unnecessary re-renders.
  const handleDevicePress = (device) => {
    navigation.navigate('DeviceDetail', { deviceId: device.id });
  };

  const renderItem = ({ item }) => (
    <DeviceCard
      device={item}
      onPress={handleDevicePress}
    />
  );

  const keyExtractor = (item) => item.id;

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
      {error && (
        <ErrorBanner message={error} onRetry={fetchDevices} />
      )}

      {/* SyncStatus component — wire this up as part of the offline-first feature */}
      {/* <SyncStatus status="syncing" lastSyncedAt={null} onRetry={fetchDevices} /> */}

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={devices.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState message="No devices found" />
        }
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
