import { Redirect } from 'expo-router';
import React from 'react';

import AppTabs from '@/components/app-tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsAuthReady, useSession } from '@/queries/use-session';
import { Text, View } from 'react-native';

/**
 * Auth guard for all protected screens.
 * - Waits for the initial session check to complete before making redirect decisions.
 * - Redirects to login if there is no active session.
 * - Renders the tab navigator when authenticated.
 */
export default function AppLayout() {
  const isReady = useIsAuthReady();
  const session = useSession();

  if (!isReady) {
    return <LoadingSpinner fullscreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // return <View style={{ backgroundColor: "black", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "white" }}>Welcome to the app!</Text></View>;

  return <AppTabs />;
}
