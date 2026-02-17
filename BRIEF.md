# BRIEF — Device List: Performance Fixes + Offline-First Feature

**Type:** Bug Fix + Feature  
**Screen:** `DeviceListScreen`, `useDevices` hook  
**Complexity:** Medium–High  
**Estimated:** 2–3 hours

---

## 1. Background

This app displays a list of connected IoT devices and their current status. Users navigate between a list view, a detail view, and a scan screen. The app fetches device data from an API and should present it reliably even in poor connectivity conditions.

Current state: the app works, but has two significant bugs and is missing offline support.

---

## 2. Bug Analysis

### Bug 1 — Excessive Re-renders on DeviceListScreen

**Current behaviour:**  
`DeviceListScreen` re-renders on every navigation event. When the user switches tabs and comes back to the device list, the screen re-renders the entire list. On devices with many items (50+), this causes visible lag (dropped frames during list swipe).

The issue is observable in React DevTools Profiler — the component tree re-renders on every `useFocusEffect` call.

**Root causes:**

1. **`useDevices` hook recreates callback references on every render.** The `fetchDevices` function is defined inside the hook without `useCallback`. This means any component using `useDevices` gets a new function reference on every render, causing child components that receive it as a prop to re-render even when data hasn't changed.

2. **`DeviceCard` is not memoized.** It receives `onPress` and `device` as props. Even if `device` data hasn't changed, it re-renders because the parent re-creates the `onPress` callback on every render.

3. **`DeviceListScreen` fetches on every focus event** using `useFocusEffect` without any throttling. Switching to another tab and back triggers a full re-fetch, which causes the list to flash (items disappear while loading, then reappear).

**Expected behaviour:**
- Switching tabs and returning does not cause unnecessary re-renders
- List items do not re-render unless their data has actually changed
- Navigation events do not trigger fetches more than once every 30 seconds (unless the user explicitly pulls to refresh)

**Implementation notes:**
- `useCallback` and `useMemo` are the tools here — but apply them correctly, not everywhere indiscriminately
- The `useFocusEffect` fetch should be throttled: track `lastFetchedAt` and skip the fetch if it was less than 30 seconds ago
- `DeviceCard` should use `React.memo` with a proper comparison function — but only wrap what needs wrapping

---

### Bug 2 — Pull-to-Refresh Doesn't Work (Stale State)

**Current behaviour:**  
The `FlatList` in `DeviceListScreen` has a `refreshControl` prop wired up. When the user pulls to refresh:
1. The spinner appears
2. `handleRefresh` is called
3. `fetchDevices()` is called
4. The spinner disappears
5. **The list doesn't update** — it shows the same data as before

**Root cause:**  
`handleRefresh` in `DeviceListScreen` calls `fetchDevices()` but the result isn't awaited correctly. `fetchDevices` in `useDevices` is an async function, but `handleRefresh` doesn't await it — it sets `refreshing` to `false` immediately after calling `fetchDevices()`, before the fetch completes.

Secondary issue: `fetchDevices` updates state via `setDevices`, but `DeviceListScreen` reads from a locally-scoped variable that doesn't reflect the new state until the next render cycle. The component reads `devices` from the hook but the `handleRefresh` function captures a stale closure reference.

**Expected behaviour:**
- Pull-to-refresh shows spinner while fetch is in progress
- On completion, the list updates with fresh data
- On error, the spinner hides and an error is shown
- Pulling to refresh always bypasses the 30-second throttle from Bug 1

---

## 3. Feature: Offline-First Device List

### Overview

The device list should work without a network connection. When the user opens the app (or navigates to the device list):

1. **Immediately show cached data** from the previous successful fetch
2. **Trigger a background sync** — fetch fresh data from the API
3. **Update the list** when fresh data arrives (without a loading flash)
4. **Show a sync status indicator** — "Last synced: 2 minutes ago" or "Syncing..." or "Offline"

### Cache spec

**Storage:** Use `AsyncStorage` via the `storage.js` wrapper in `src/utils/storage.js`.

**Cache key:** `'devices_cache'`

**Cache structure:**
```json
{
  "data": [...],          // array of device objects
  "timestamp": 1708944000000,  // Date.now() at time of last successful fetch
  "version": 1            // cache version — increment if schema changes
}
```

**Cache validity:** Never expires automatically — always show cache immediately, always attempt background refresh. The app does not go "offline only" based on cache age; it always tries to refresh.

**Cache invalidation:** When the user explicitly pulls to refresh, force-refresh even if a background sync is already in progress. Cancel the in-flight background sync if possible (use AbortController).

### Sync status indicator

**Component:** `SyncStatus` (skeleton in `src/components/SyncStatus.js`)

**States to display:**

| State | Display |
|-------|---------|
| `syncing` | "Syncing..." (with activity indicator) |
| `synced` | "Updated just now" or "Updated 3 min ago" |
| `error` | "Sync failed — tap to retry" |
| `offline` | "Offline — showing cached data" |

**State transitions:**
- On app open: show last synced time from cache timestamp (if cache exists), trigger background sync
- While syncing: show "Syncing..."
- On success: update timestamp, show "Updated X ago"
- On network error: show "Offline" if no network, "Sync failed" if network but API error
- Tap on error state: retry sync

**Positioning:** The `SyncStatus` component appears below the list header, above the first list item. It should not cause layout shift when transitioning between states.

### Offline detection

Use `@react-native-community/netinfo` (already in dependencies) to detect connectivity.

- If `NetInfo.isConnected` is false: skip the fetch, show "Offline" status, still show cache
- If reconnected: automatically trigger background sync

### Loading states

**With cache available:**  
- Show cached list immediately (no loading spinner)
- Show "Syncing..." in the sync status indicator
- When fresh data arrives: update list in-place (no flash, no spinner over the list)

**Without cache (first launch):**  
- Show a skeleton list or `EmptyState` component with "Loading devices..." message
- Show full-screen loading spinner is acceptable for this case only

### Implementation guide

1. **`useDeviceCache` hook** (`src/hooks/useDeviceCache.js` — skeleton provided)  
   - `getCachedDevices()` → returns `{ data, timestamp }` or null
   - `setCachedDevices(devices)` → stores with current timestamp
   - `clearCache()` → removes cache entry

2. **Update `useDevices` hook**  
   - On init: load cache, set devices from cache immediately
   - Trigger background sync
   - On sync success: update state + update cache
   - Expose: `{ devices, isLoading, isSyncing, syncStatus, lastSyncedAt, error, fetchDevices, refresh }`

3. **`SyncStatus` component**  
   - Accepts: `{ status, lastSyncedAt, onRetry }`
   - `status`: `'syncing' | 'synced' | 'error' | 'offline'`
   - Show relative time ("3 min ago") — update every 30 seconds using `setInterval`

4. **`DeviceListScreen` updates**  
   - Use `isSyncing` (not `isLoading`) to decide whether to show the status indicator
   - Remove the full-screen spinner for the online case (keep it for first-launch no-cache case)
   - Wire up `<SyncStatus>` component

---

## 4. Edge Cases

- **Rapid tab switching** — if the user switches away and back quickly (< 30s), no re-fetch, no re-render
- **Background sync races** — if a background sync is in-flight and the user pulls to refresh, the background sync should be cancelled (AbortController) and the pull-to-refresh fetch takes over
- **Empty cache + offline** — show `EmptyState` with "You're offline and there's no cached data"
- **Stale cache indicator** — if the cache is >1 hour old and a sync fails, add a subtle "Data may be outdated" note to the error state
- **Device list updates** — when the background sync returns different data, the list should update without scrolling the user to the top (preserve scroll position)
- **Cache version mismatch** — if the cache version doesn't match the current version constant, discard the cache and start fresh

---

## 5. Files to Focus On

**Primary (bugs + feature):**
- `src/hooks/useDevices.js` — fix re-render issues, add cache integration
- `src/screens/DeviceListScreen.js` — fix pull-to-refresh, integrate SyncStatus
- `src/components/DeviceCard.js` — memoize correctly
- `src/hooks/useDeviceCache.js` — implement from skeleton
- `src/components/SyncStatus.js` — implement from skeleton

**Reference:**
- `src/api/devices.js` — mock API (configurable delay + failure rate)
- `src/utils/storage.js` — AsyncStorage wrapper
- `src/context/DeviceContext.js` — if you prefer context over hook-level state

---

## 6. Mock API Notes

`src/api/devices.js` exports:
```js
fetchDevices()           // returns Promise<Device[]>
fetchDevice(id)         // returns Promise<Device>
```

Configurable at the top of the file:
```js
const MOCK_DELAY_MS = 1200;    // simulated network delay
const MOCK_FAILURE_RATE = 0.1; // 10% chance of error — test your error handling!
```

Set `MOCK_FAILURE_RATE = 1` to always fail, useful for testing offline/error states.

Each device object:
```json
{
  "id": "dev_abc123",
  "name": "Sensor Node 01",
  "type": "temperature",
  "status": "online",
  "battery": 87,
  "lastSeen": "2026-02-17T14:30:00.000Z",
  "location": "Zone A"
}
```
