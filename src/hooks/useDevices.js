import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { fetchDevices as fetchDevicesAPI } from '../api/devices';
import { useDeviceCache } from './useDeviceCache';
import NetInfo from '@react-native-community/netinfo';

/**
 * useDevices hook
 *
 * Fetches and manages device list state with offline-first caching.
 *
 * Features:
 * 1. Memoized fetchDevices callback with useCallback
 * 2. Cache integration — load from cache on init, sync in background
 * 3. AbortController support — cancel in-flight requests
 * 4. Throttled fetches — skip refetch if < 30 seconds since last
 * 5. Network detection — NetInfo integration
 *
 * Returns:
 *   - devices: Device[]
 *   - isLoading: boolean (true only on first load with no cache)
 *   - isSyncing: boolean (true during background sync)
 *   - error: string | null
 *   - syncStatus: 'syncing' | 'synced' | 'error' | 'offline' | null
 *   - lastSyncedAt: number | null (Date.now() timestamp)
 *   - fetchDevices: (options?: { force: boolean }) => Promise<void>
 *   - refresh: () => Promise<void>
 */
export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const { getCachedDevices, setCachedDevices } = useDeviceCache();

  // Track last fetch time for throttling
  const lastFetchedAtRef = useRef(0);

  // Track in-flight request for abort on cancel
  const abortControllerRef = useRef(null);

  // Race condition safety: prevent stale requests from updating state
  const activeRequestIdRef = useRef(0);

  // Prevent state updates after unmount
  const mountedRef = useRef(true);

  const THROTTLE_MS = 30 * 1000; // 30 seconds
  const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour for stale cache detection

  const performFetch = useCallback(
    async (options = {}) => {
      const { force = false, isBackgroundSync = false } = options;

      // Guard: only proceed if component is still mounted
      if (!mountedRef.current) return;

      // Generate request ID for race condition detection
      const requestId = ++activeRequestIdRef.current;

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setIsOnline(false);
        if (!isBackgroundSync) {
          setSyncStatus('offline');
        }
        return;
      }
      setIsOnline(true);

      // Throttle check for background syncs (not for explicit refreshes)
      if (!force && !isBackgroundSync) {
        const now = Date.now();
        if (now - lastFetchedAtRef.current < THROTTLE_MS) {
          return;
        }
      }

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!isBackgroundSync) {
        setIsLoading(true);
      } else {
        setIsSyncing(true);
        setSyncStatus('syncing');
      }

      try {
        const data = await fetchDevicesAPI(abortControllerRef.current.signal);

        // Race condition guard: only update if this request is still active
        if (!mountedRef.current || activeRequestIdRef.current !== requestId) return;

        setDevices(data);
        const now = Date.now();
        await setCachedDevices(data);
        setLastSyncedAt(now);
        setError(null);
        setSyncStatus(isBackgroundSync ? 'synced' : null);
        lastFetchedAtRef.current = now;
      } catch (err) {
        // Ignore abort errors — they're expected when cancelling
        if (err.name === 'AbortError') {
          return;
        }

        // Race condition guard: only update if this request is still active
        if (!mountedRef.current || activeRequestIdRef.current !== requestId) return;

        setError(err.message);
        setSyncStatus(isBackgroundSync ? 'error' : null);
      } finally {
        if (!isBackgroundSync) {
          setIsLoading(false);
        } else {
          setIsSyncing(false);
        }
      }
    },
    [setCachedDevices]
  );

  // Load cache and set up background sync on mount
  useEffect(() => {
    const initAsync = async () => {
      // Load from cache first
      const cache = await getCachedDevices();
      if (cache) {
        setDevices(cache.data);
        setLastSyncedAt(cache.timestamp);
        setIsLoading(false);
      }

      // Always try to sync in background
      await performFetch({ isBackgroundSync: true });
    };

    initAsync();

    // Listen for network connectivity changes
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
      if (state.isConnected && !isSyncing) {
        // Auto-sync when connection is restored
        performFetch({ isBackgroundSync: true });
      }
    });

    // Listen for app foreground transitions
    const handleAppStateChange = (state) => {
      if (state === 'active') {
        performFetch({ isBackgroundSync: true });
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      mountedRef.current = false;
      unsubscribeNetInfo();
      subscription.remove();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [];

  // Memoized fetchDevices — can be called from components without recreating
  const fetchDevices = useCallback(
    async (options) => performFetch(options),
    [performFetch]
  );

  // Refresh function — force a new fetch
  const refresh = useCallback(async () => {
    // Cancel background sync if in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    await performFetch({ force: true });
  }, [performFetch]);

  // Detect if cache is stale (>1 hour old) for error state messaging
  const isStaleCacheOnError = lastSyncedAt && Date.now() - lastSyncedAt > ONE_HOUR_MS;

  return {
    devices,
    isLoading,
    isSyncing,
    error,
    syncStatus,
    lastSyncedAt,
    isStaleCacheOnError,
    fetchDevices,
    refresh,
  };
}
