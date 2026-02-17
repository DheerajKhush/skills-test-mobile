# YDM Skills Test — Mobile App Developer

A focused, practical skills test. Expect **2–3 hours**.

You're working with a React Native (Expo) mini-app that manages a list of IoT devices. There are two bugs and one feature to implement.

---

## Setup

```bash
npm install
npx expo start
```

Requires: Node.js 18+, Expo Go app on your device or a simulator.

```bash
# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android
```

The app uses a local mock API (no real backend needed) — mock responses are in `src/api/devices.js`.

---

## What's in the repo

```
src/
  screens/
    DeviceListScreen.js     ← Main screen — bugs live here
    DeviceDetailScreen.js   ← Device detail view
    DeviceScanScreen.js     ← Scan for new devices
  components/
    DeviceCard.js           ← Individual device row
    SyncStatus.js           ← Sync status indicator (skeleton)
    EmptyState.js           ← Empty list component
    ErrorBanner.js          ← Error display component
  hooks/
    useDevices.js           ← Data fetching hook — bugs live here too
    useDeviceCache.js       ← Cache hook (skeleton — implement this)
  context/
    DeviceContext.js        ← Device state management
  navigation/
    AppNavigator.js         ← Stack + tab navigation
  api/
    devices.js              ← Mock API client
  utils/
    storage.js              ← AsyncStorage wrapper
App.js                      ← Entry point
app.json                    ← Expo config
```

---

## Instructions

1. **Fork this repository**
2. **Read `BRIEF.md`** — full spec, current vs expected behaviour, implementation requirements
3. **Implement** the bug fixes and offline-first feature
4. **Open a PR** from your fork when done

---

## Evaluation criteria

- **Re-render fix is real** — not just wrapping everything in `memo()` blindly
- **Pull-to-refresh works** — the refresh actually fetches fresh data and updates the list
- **Offline-first** — shows cached data immediately, syncs in background, correct status indicator
- **Cache is correct** — stale cache is shown, then replaced; not just a loading spinner
- **TypeScript** — if you convert to TS (optional), it should be correct, not just `any` everywhere
- **Code quality** — clean hooks, no stale closures, effects have correct dependencies
- **PR description** — explains your approach and tradeoffs

---

## Ground rules

- Expo managed workflow — don't eject
- Don't swap out the navigation library
- The mock API has configurable latency and failure modes — use them to test your implementation
- AI tools are expected — note what you used in the PR

---

## Questions?

Make reasonable assumptions and document them in the PR.
