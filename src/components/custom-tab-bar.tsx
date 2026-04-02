import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Primary } from '@/constants/theme';

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabConfig = {
  icon: SymbolViewProps['name'];
  label: string;
};

const TABS: Record<string, TabConfig> = {
  index: {
    label: 'Home',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
  },
  explore: {
    label: 'Explore',
    icon: { ios: 'safari', android: 'explore', web: 'explore' },
  },
  notifications: {
    label: 'Alerts',
    icon: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  },
  profile: {
    label: 'Profile',
    icon: { ios: 'person.circle.fill', android: 'person', web: 'person' },
  },
};

const INACTIVE = '#9CA3AF';

// ─── Component ────────────────────────────────────────────────────────────────
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab       = TABS[route.name] ?? TABS.index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params as never);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {/* Active dot — sits above the icon */}
              <View style={styles.dotRow}>
                <View style={[styles.dot, isFocused && styles.dotActive]} />
              </View>

              {/* Icon */}
              <SymbolView
                name={tab.icon}
                size={24}
                tintColor={isFocused ? Primary : INACTIVE}
              />

              {/* Label */}
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  dotRow: {
    height: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: Primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: INACTIVE,
  },
  labelActive: {
    color: Primary,
    fontWeight: '600',
  },
});
