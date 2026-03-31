import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IS_MOCK_MODE } from '@/constants/config';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/queries/use-profile';
import { useSession } from '@/queries/use-session';

export default function HomeScreen() {
  const { t } = useTranslation();
  const session = useSession();
  const { data: profile, isLoading } = useProfile();

  const displayName = profile?.full_name ?? session?.user.email ?? '…';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText type="title">
                {t('home.greeting', { name: profile?.full_name?.split(' ')[0] ?? 'there' })}
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {session?.user.email}
              </ThemedText>
            </View>
            <Avatar uri={profile?.avatar_url} name={displayName} size={52} />
          </View>

          {/* Mock mode banner */}
          {IS_MOCK_MODE ? (
            <ThemedView type="backgroundElement" style={styles.mockBanner}>
              <ThemedText type="smallBold">Mock Mode is ON</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Set EXPO_PUBLIC_USE_MOCK=false in .env to connect real Supabase.
              </ThemedText>
            </ThemedView>
          ) : null}

          {/* Profile card */}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Card style={styles.profileCard}>
              <ThemedText type="smallBold">Profile</ThemedText>
              <View style={styles.profileRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Name
                </ThemedText>
                <ThemedText type="small">{profile?.full_name ?? '—'}</ThemedText>
              </View>
              <View style={styles.profileRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Bio
                </ThemedText>
                <ThemedText type="small" style={styles.bioText}>
                  {profile?.bio ?? '—'}
                </ThemedText>
              </View>
            </Card>
          )}

          {/* Stack overview */}
          <Card>
            <ThemedText type="smallBold" style={styles.stackTitle}>
              What&apos;s wired up
            </ThemedText>
            {STACK_ITEMS.map((item) => (
              <View key={item.label} style={styles.stackRow}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.stackLabel}>
                  {item.label}
                </ThemedText>
                <ThemedText type="small">{item.value}</ThemedText>
              </View>
            ))}
          </Card>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const STACK_ITEMS = [
  { label: 'Auth', value: 'Supabase Auth' },
  { label: 'Server state', value: 'TanStack Query' },
  { label: 'Client state', value: 'Zustand' },
  { label: 'i18n', value: 'i18next (en / es)' },
  { label: 'Notifications', value: 'expo-notifications' },
  { label: 'Mock mode', value: IS_MOCK_MODE ? 'ON ✓' : 'OFF' },
];

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
  },
  headerText: {
    gap: 2,
    flex: 1,
  },
  mockBanner: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: 4,
  },
  profileCard: {
    gap: Spacing.two,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  bioText: {
    flex: 1,
    textAlign: 'right',
  },
  stackTitle: {
    marginBottom: Spacing.two,
  },
  stackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stackLabel: {
    width: 110,
  },
});
