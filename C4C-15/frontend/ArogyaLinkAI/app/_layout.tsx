import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import '../utils/i18n';

export default function Layout() {
  useEffect(() => {
    SecureStore.getItemAsync('colorScheme').then((saved) => {
      Appearance.setColorScheme(saved === 'dark' ? 'dark' : 'light');
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
