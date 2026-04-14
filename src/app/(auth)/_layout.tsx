import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsAuthReady, useSession } from '@/queries/use-session';

export default function AuthLayout() {
  const isReady = useIsAuthReady();
  const session = useSession();

  // Wait for the initial session check before making any redirect decisions.
  if (!isReady) {
    return <LoadingSpinner fullscreen />;
  }

  // Already signed in — send straight to the app.
  if (session) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
