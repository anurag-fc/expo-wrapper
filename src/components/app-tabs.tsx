import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from './custom-tab-bar';

export default function AppTabs() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="profile" />
      {/* Hidden from tab bar but kept for routing compatibility */}
      <Tabs.Screen name="explore"       options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
