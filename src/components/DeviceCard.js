import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * DeviceCard — memoized with a custom comparator that checks only rendered
 * device fields + onPress identity. Parent must provide a stable onPress
 * (useCallback) for the memo to be effective.
 */

/** Device fields used in this component: id, status, lastSeen, name, type, location, battery */
function isDeviceEqual(prevDevice, nextDevice) {
  if (prevDevice === nextDevice) return true;
  if (!prevDevice || !nextDevice) return false;
  return (
    prevDevice.id === nextDevice.id &&
    prevDevice.status === nextDevice.status &&
    prevDevice.lastSeen === nextDevice.lastSeen &&
    prevDevice.name === nextDevice.name &&
    prevDevice.type === nextDevice.type &&
    prevDevice.location === nextDevice.location &&
    prevDevice.battery === nextDevice.battery
  );
}

const STATUS_CONFIG = {
  online: { color: '#22C55E', label: 'Online' },
  offline: { color: '#EF4444', label: 'Offline' },
  warning: { color: '#F59E0B', label: 'Warning' },
};

function DeviceCard({ device, onPress }) {
  const status = STATUS_CONFIG[device.status] || { color: '#999', label: device.status };

  const lastSeenDate = new Date(device.lastSeen);
  const now = new Date();
  const diffMs = now - lastSeenDate;
  const diffMins = Math.floor(diffMs / 60000);

  let lastSeenText;
  if (diffMins < 1) lastSeenText = 'Just now';
  else if (diffMins < 60) lastSeenText = `${diffMins}m ago`;
  else if (diffMins < 1440) lastSeenText = `${Math.floor(diffMins / 60)}h ago`;
  else lastSeenText = lastSeenDate.toLocaleDateString();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {device.type} · {device.location || 'No location'} · {lastSeenText}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {device.battery !== null && (
          <View style={styles.battery}>
            <Text style={[
              styles.batteryText,
              device.battery < 20 && styles.batteryLow
            ]}>
              {device.battery}%
            </Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// Memoized DeviceCard — re-render only when device or onPress props change
export default React.memo(DeviceCard, (prevProps, nextProps) => {
  // Return true if props are equal (no re-render), false if they differ (re-render)
  return (
    isDeviceEqual(prevProps.device, nextProps.device) &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  meta: {
    fontSize: 13,
    color: '#888',
    textTransform: 'capitalize',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  battery: {},
  batteryText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  batteryLow: {
    color: '#EF4444',
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    color: '#CCC',
    lineHeight: 22,
  },
});
