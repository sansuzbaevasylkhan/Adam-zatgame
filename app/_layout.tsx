import { useEffect } from 'react';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenCapture from 'expo-screen-capture';
import * as NavigationBar from 'expo-navigation-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { SettingsProvider } from '@/lib/settingsContext';
import '@/lib/i18n';
import { useFonts } from 'expo-font';
import { Unbounded_600SemiBold, Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function AppInner() {
  const { refreshProfile } = useAuth();
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
    // 1. Fullscreen / Immersive Mode (Android)
    async function setupImmersiveMode() {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (e) {
        console.warn("Failed to set immersive mode:", e);
      }
    }
    setupImmersiveMode();

    // 2. AppState Listener (Фонға кеткенде синхрондау)
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App returned to active state, refreshing profile...');
        await refreshProfile();
      }
    });

    // 3. Screenshots block
    async function disableScreenshots() {
      try {
        const capture = ScreenCapture as any;
        if (capture && typeof capture.preventScreenshotAsync === 'function') {
          await capture.preventScreenshotAsync();
        }
      } catch (e) {
        console.warn("Failed to block screenshots:", e);
      }
    }
    disableScreenshots();

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <View style={{ flex: 1 }}>
            <AppInner />
            <StatusBar hidden />
          </View>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
