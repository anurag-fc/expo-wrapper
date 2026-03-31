import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './ExploreScreen.styles';

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
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
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
              <ThemedText type="code">.env</ThemedText> file. Set it to{' '}
              <ThemedText type="code">false</ThemedText> and fill in your Supabase credentials to
              switch to real data.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Authentication">
            <ThemedText type="small">
              Full auth flow in <ThemedText type="code">src/app/(auth)/</ThemedText>. The auth
              guard in <ThemedText type="code">src/app/(app)/_layout.tsx</ThemedText> protects all
              app screens automatically.
            </ThemedText>
          </Collapsible>

          <Collapsible title="State management">
            <ThemedText type="small">
              <ThemedText type="code">TanStack Query</ThemedText> handles server state.{' '}
              <ThemedText type="code">Zustand</ThemedText> handles client/UI state. They never
              overlap.
            </ThemedText>
          </Collapsible>

          <Collapsible title="i18n">
            <ThemedText type="small">
              English and Spanish set up. Strings in{' '}
              <ThemedText type="code">src/lib/i18n/locales/</ThemedText>. Switch language from the
              Profile screen.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Push notifications">
            <ThemedText type="small">
              <ThemedText type="code">NotificationProvider</ThemedText> handles incoming
              notifications and deep-link routing. Request permission via{' '}
              <ThemedText type="code">useNotificationPermission()</ThemedText>.
            </ThemedText>
          </Collapsible>

          <Collapsible title="File-based routing">
            <ThemedText type="small">
              Routes split into <ThemedText type="code">(auth)/</ThemedText> and{' '}
              <ThemedText type="code">(app)/</ThemedText> groups. Screen logic lives in{' '}
              <ThemedText type="code">src/screens/</ThemedText>.
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
