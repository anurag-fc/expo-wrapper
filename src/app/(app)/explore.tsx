import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Explore</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            This wrapper includes example{'\n'}code to help you get started.
          </ThemedText>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">Expo documentation</ThemedText>
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                  size={12}
                />
              </ThemedView>
            </Pressable>
          </ExternalLink>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="Mock mode">
            <ThemedText type="small">
              All API calls are mocked when{' '}
              <ThemedText type="code">EXPO_PUBLIC_USE_MOCK=true</ThemedText> in your{' '}
              <ThemedText type="code">.env</ThemedText> file. Services return dummy data with a
              simulated network delay so loading states are exercised. Set it to{' '}
              <ThemedText type="code">false</ThemedText> and fill in your Supabase credentials to
              switch to real data.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Authentication">
            <ThemedText type="small">
              Full auth flow is in <ThemedText type="code">src/app/(auth)/</ThemedText> — login,
              register, forgot password. The auth guard lives in{' '}
              <ThemedText type="code">src/app/(app)/_layout.tsx</ThemedText> and protects all app
              screens automatically.
            </ThemedText>
          </Collapsible>

          <Collapsible title="State management">
            <ThemedText type="small">
              <ThemedText type="code">TanStack Query</ThemedText> handles server state (profiles,
              notifications). <ThemedText type="code">Zustand</ThemedText> handles client/UI state
              (auth session, toasts, unread count). They never overlap.
            </ThemedText>
          </Collapsible>

          <Collapsible title="i18n">
            <ThemedText type="small">
              Two languages are set up: English and Spanish. Strings live in{' '}
              <ThemedText type="code">src/lib/i18n/locales/</ThemedText>. Switch language from the
              Profile screen. Add more languages by adding a new locale file and registering it in{' '}
              <ThemedText type="code">src/lib/i18n/index.ts</ThemedText>.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Push notifications">
            <ThemedText type="small">
              <ThemedText type="code">NotificationProvider</ThemedText> handles incoming
              notifications and deep-link routing on tap. Request permission from the UI at the
              right moment using the{' '}
              <ThemedText type="code">useNotificationPermission()</ThemedText> hook.
            </ThemedText>
          </Collapsible>

          <Collapsible title="File-based routing">
            <ThemedText type="small">
              Routes are split into two groups:{' '}
              <ThemedText type="code">(auth)/</ThemedText> for unauthenticated screens and{' '}
              <ThemedText type="code">(app)/</ThemedText> for protected screens. The group
              layouts handle redirects so you never need a{' '}
              <ThemedText type="code">ProtectedRoute</ThemedText> wrapper component.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: { maxWidth: MaxContentWidth, flexGrow: 1 },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: { textAlign: 'center' },
  pressed: { opacity: 0.7 },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
