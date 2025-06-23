import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PortfolioScreen from '../screens/PortfolioScreen';
import ArtDetailScreen from '../screens/ArtDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Portfolio" component={PortfolioScreen} />
      <Stack.Screen name="ArtDetail" component={ArtDetailScreen} />
    </Stack.Navigator>
  );
}
