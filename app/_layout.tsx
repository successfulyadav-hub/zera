import { useEffect, useState } from 'react';
import { LogBox, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fontAssets } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { initDatabase } from '@/database/migrations';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { Toast } from '@/components/ui';
import { UndoToast } from '@/components/ui/UndoToast';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { NetworkStatus } from '@/components/shared/NetworkStatus';
import { requestNotificationPermissions, useNotificationResponse } from '@/utils/notifications';

if (Platform.OS === 'web') {
  LogBox.ignoreAllLogs(true);
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (e) => {
      e.preventDefault();
    });
    window.addEventListener('error', (e) => {
      if (e.message?.includes?.('expo-sqlite') || e.message === 'Unknown') {
        e.preventDefault();
      }
    });
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [dbReady, setDbReady] = useState(false);
  const { colors, isDark } = useTheme();
  const loadSettings = useSettingsStore((s) => s.load);
  const initAuth = useAuthStore((s) => s.initialize);
  const toast = useToast();
  const undoToast = useUndoToast();
  const router = useRouter();
  const notificationResponse = useNotificationResponse();

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.warn('DB Init Error:', e);
        setDbReady(true);
      });
    loadSettings();
    initAuth();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!notificationResponse || !dbReady) return;
    const data = notificationResponse.notification.request.content.data;
    if (data?.type === 'reminder' && data.reminderId) {
      router.push(`/reminder/${data.reminderId}`);
    } else if (data?.type === 'task' && data.date) {
      router.push(`/day/${data.date}`);
    }
  }, [notificationResponse, dbReady]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady]);

  if ((!fontsLoaded && !fontError) || !dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <NetworkStatus />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/login" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/signup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="note/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="note/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="event/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="event/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="reminder/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="reminder/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="search" options={{ presentation: 'modal', animation: 'fade' }} />
          <Stack.Screen name="day/[date]" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <Toast message={toast.message} visible={toast.visible} onHide={toast.hide} type={toast.type} />
        <UndoToast
          message={undoToast.message}
          visible={undoToast.visible}
          onHide={undoToast.hide}
          onUndo={undoToast.performUndo}
        />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
