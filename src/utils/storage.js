import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper with JSON serialization
 */

export async function getItem(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (err) {
    console.warn(`storage.getItem error for key "${key}":`, err.message);
    return null;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`storage.setItem error for key "${key}":`, err.message);
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`storage.removeItem error for key "${key}":`, err.message);
  }
}

export async function clear() {
  try {
    await AsyncStorage.clear();
  } catch (err) {
    console.warn('storage.clear error:', err.message);
  }
}
