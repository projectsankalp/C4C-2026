import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'),
    'PlusJakartaSans-Medium': require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFF7F8' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="otp-login" />
      <Stack.Screen name="calm-wave-home" />
      <Stack.Screen name="micro-checkin" />
      <Stack.Screen name="breathing-tools" />
      <Stack.Screen name="swasthya-chat" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="wellness-timeline" />
      <Stack.Screen name="gp-screen" />
    </Stack>
  );
}
