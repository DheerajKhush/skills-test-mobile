import { getItem, setItem, removeItem } from '../utils/storage';

/**
 * useDeviceCache — skeleton
 *
 * Implement this hook as part of the offline-first feature.
 * See BRIEF.md → Feature: Offline-First Device List → Implementation guide.
 *
 * Cache key: 'devices_cache'
 * Cache structure:
 *   {
 *     data: Device[],
 *     timestamp: number,  // Date.now()
 *     version: number     // increment if cache schema changes
 *   }
 *
 * Current cache version: 1
 */

const CACHE_KEY = 'devices_cache';
const CACHE_VERSION = 1;

export function useDeviceCache() {
  /**
   * Load cached devices from AsyncStorage.
   * Returns null if no cache exists or cache version is outdated.
   * @returns {Promise<{ data: Device[], timestamp: number } | null>}
   */
  async function getCachedDevices() {
    // TODO: implement
    // 1. Load from storage using CACHE_KEY
    // 2. Return null if missing
    // 3. Return null if version !== CACHE_VERSION (discard stale schema)
    // 4. Return { data, timestamp }
    return null;
  }

  /**
   * Save devices to cache with current timestamp.
   * @param {Device[]} devices
   */
  async function setCachedDevices(devices) {
    // TODO: implement
    // Store: { data: devices, timestamp: Date.now(), version: CACHE_VERSION }
  }

  /**
   * Clear the device cache.
   */
  async function clearCache() {
    // TODO: implement
    await removeItem(CACHE_KEY);
  }

  return { getCachedDevices, setCachedDevices, clearCache };
}
