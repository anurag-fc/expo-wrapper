import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from './custom-tab-bar';

export default function AppTabs() {
  return (
    <Tabs
      initialRouteName="explore"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
