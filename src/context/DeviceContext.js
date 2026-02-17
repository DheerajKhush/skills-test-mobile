import React, { createContext, useContext } from 'react';

/**
 * DeviceContext — optional context for sharing device state across screens.
 *
 * Currently not used — the useDevices hook is used directly in DeviceListScreen.
 * You may refactor to use this context if your offline-first implementation
 * benefits from shared state (e.g., to avoid multiple fetches across tabs).
 */

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  // TODO: optionally lift useDevices state here if needed for offline-first implementation
  return (
    <DeviceContext.Provider value={null}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceContext() {
  const ctx = useContext(DeviceContext);
  // Not required to use — return null if not implemented
  return ctx;
}
