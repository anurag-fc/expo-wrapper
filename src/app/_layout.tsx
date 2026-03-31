import '@/lib/i18n'; // initializes i18next before any component renders

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSplashScreen } from '@/components/app-splash-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AuthProvider } from '@/providers/auth-provider';
import { NotificationProvider } from '@/providers/notification-provider';
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // ErrorBoundary at the very root catches catastrophic failures gracefully.
    <ErrorBoundary>
      {/* GestureHandlerRootView must be the absolute outermost native wrapper. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {/* QueryProvider before AuthProvider so auth can seed the query cache on sign-in. */}
          <QueryProvider>
            <AuthProvider>
              {/* NotificationProvider after AuthProvider so tokens are tied to a signed-in user. */}
              <NotificationProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <AppSplashScreen>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(app)" />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                  </AppSplashScreen>
                </ThemeProvider>
              </NotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
