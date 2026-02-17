import { useState, useEffect } from 'react';
import { fetchDevices } from '../api/devices';

/**
 * useDevices hook
 *
 * Fetches and manages device list state.
 *
 * BUGS in this file:
 * 1. fetchDevices is defined without useCallback — new reference on every render
 * 2. No cache integration — always shows loading state on mount
 * 3. No AbortController — can't cancel in-flight requests
 *
 * See BRIEF.md for full spec.
 */
export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // BUG: This function is recreated on every render because it's not wrapped in useCallback.
  // Any component that receives this as a prop will re-render unnecessarily.
  const fetchAllDevices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDevices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    devices,
    isLoading,
    error,
    fetchDevices: fetchAllDevices,
  };
}
