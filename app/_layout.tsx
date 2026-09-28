import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenCapture from 'expo-screen-capture';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { SettingsProvider } from '@/lib/settingsContext';
import '@/lib/i18n';
import { useFonts } from 'expo-font';
import {
  Unbounded_600SemiBold,
  Unbounded_700Bold,
} from '@expo-google-fonts/unbounded';
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Unbounded-Bold': Unbounded_700Bold,
    'Unbounded-SemiBold': Unbounded_600SemiBold,
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(e => console.warn("SplashScreen hide error:", e));
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    async function disableScreenshots() {
      try {
        // Using 'any' to bypass TS error as some versions of expo-screen-capture
        // might have different naming or are not correctly typed in some environments
        const capture = ScreenCapture as any;
        if (capture && typeof capture.preventScreenshotAsync === 'function') {
          await capture.preventScreenshotAsync();
        }
      } catch (e) {
        console.warn("Failed to block screen capture:", e);
      }
    }
    disableScreenshots();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null; // Let SplashScreen handle the loading state for smoother transition
  }

  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
