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
    const cache = await getItem(CACHE_KEY);
    if (!cache) return null;
    if (cache.version !== CACHE_VERSION) return null;
    return { data: cache.data, timestamp: cache.timestamp };
  }

  /**
   * Save devices to cache with current timestamp.
   * @param {Device[]} devices
   */
  async function setCachedDevices(devices) {
    await setItem(CACHE_KEY, {
      data: devices,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    });
  }

  /**
   * Clear the device cache.
   */
  async function clearCache() {
    await removeItem(CACHE_KEY);
  }

  return { getCachedDevices, setCachedDevices, clearCache };
}
