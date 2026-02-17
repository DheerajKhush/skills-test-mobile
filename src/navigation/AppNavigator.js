import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import DeviceListScreen from '../screens/DeviceListScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import DeviceScanScreen from '../screens/DeviceScanScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DevicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DeviceList"
        component={DeviceListScreen}
        options={{ title: 'My Devices' }}
      />
      <Stack.Screen
        name="DeviceDetail"
        component={DeviceDetailScreen}
        options={{ title: 'Device Details' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0066CC',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Devices"
          component={DevicesStack}
          options={{
            tabBarLabel: 'Devices',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📡</Text>,
          }}
        />
        <Tab.Screen
          name="Scan"
          component={DeviceScanScreen}
          options={{
            title: 'Scan',
            headerShown: true,
            tabBarLabel: 'Scan',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
