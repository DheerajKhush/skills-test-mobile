import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ message = 'Nothing here yet', icon = '📭' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  icon: {
    fontSize: 48,
  },
  message: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 22,
  },
});
