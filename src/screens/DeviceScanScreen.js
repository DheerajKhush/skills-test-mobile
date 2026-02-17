import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

// Mock scan results — in a real app this would use BLE scanning
const MOCK_SCAN_RESULTS = [
  { id: 'dev_new_001', name: 'Sensor Node 08', type: 'temperature', rssi: -58 },
  { id: 'dev_new_002', name: 'Unknown Device', type: 'unknown', rssi: -82 },
];

export default function DeviceScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);

  function startScan() {
    setScanning(true);
    setResults([]);

    // Simulate scan completing after 3 seconds
    setTimeout(() => {
      setResults(MOCK_SCAN_RESULTS);
      setScanning(false);
    }, 3000);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan for Devices</Text>
        <Text style={styles.subtitle}>
          Discover new devices in range
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.scanBtnActive]}
        onPress={startScan}
        disabled={scanning}
      >
        {scanning ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.scanBtnText}>Scanning...</Text>
          </>
        ) : (
          <Text style={styles.scanBtnText}>Start Scan</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Found {results.length} device{results.length !== 1 ? 's' : ''}</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.resultCard}>
                <View>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultType}>{item.type}</Text>
                </View>
                <View style={styles.resultMeta}>
                  <Text style={styles.rssi}>{item.rssi} dBm</Text>
                  <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.resultsList}
          />
        </>
      )}

      {!scanning && results.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Tap "Start Scan" to search for nearby devices</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  scanBtn: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  scanBtnActive: {
    backgroundColor: '#004A99',
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsList: {
    gap: 8,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultType: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  resultMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rssi: {
    fontSize: 13,
    color: '#666',
  },
  addBtn: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    maxWidth: 280,
  },
});
