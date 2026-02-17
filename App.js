import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { DeviceProvider } from './src/context/DeviceContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <DeviceProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </DeviceProvider>
    </SafeAreaProvider>
  );
}
