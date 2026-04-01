import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { IS_MOCK_MODE } from '@/constants/config';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useProfile } from '@/queries/use-profile';
import { useSession } from '@/queries/use-session';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const CHIP   = '#EFEDE8';
const DARK   = '#1C1C1E';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const ACCENT = '#F5C533';
const BORDER = '#E5E2DA';

// ─── Stack items ──────────────────────────────────────────────────────────────
type StackItem = {
  label: string;
  value: string;
  icon: SymbolViewProps['name'];
};

const STACK: StackItem[] = [
  { label: 'Auth',         value: 'Supabase',       icon: { ios: 'lock.shield',               android: 'security',      web: 'security' } },
  { label: 'Server state', value: 'TanStack Query',  icon: { ios: 'arrow.triangle.2.circlepath', android: 'sync',        web: 'sync' } },
  { label: 'Client state', value: 'Zustand',         icon: { ios: 'memorychip',                android: 'memory',        web: 'memory' } },
  { label: 'i18n',         value: 'i18next',         icon: { ios: 'globe',                     android: 'language',      web: 'language' } },
  { label: 'Push',         value: 'expo-notify',     icon: { ios: 'bell.badge',                android: 'notifications', web: 'notifications' } },
  { label: 'Mock mode',    value: IS_MOCK_MODE ? 'ON' : 'OFF', icon: { ios: 'switch.2',         android: 'toggle_on',     web: 'toggle_on' } },
];

// ─── Stack cell ───────────────────────────────────────────────────────────────
function StackCell({ item }: { item: StackItem }) {
  const isMockOn = item.label === 'Mock mode' && IS_MOCK_MODE;
  return (
    <View style={styles.cell}>
      <View style={styles.cellIcon}>
        <SymbolView name={item.icon} size={16} tintColor={MUTED} />
      </View>
      <ThemedText style={styles.cellLabel}>{item.label}</ThemedText>
      <View style={styles.cellBottom}>
        <ThemedText style={styles.cellValue}>{item.value}</ThemedText>
        {isMockOn && <View style={styles.activeDot} />}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { t } = useTranslation();
  const session = useSession();
  const { data: profile, isLoading } = useProfile();

  const firstName   = profile?.full_name?.split(' ')[0] ?? 'there';
  const displayName = profile?.full_name ?? session?.user.email ?? '…';

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <ThemedText style={styles.statusText}>Dashboard</ThemedText>
            </View>
          </View>
          <Avatar uri={profile?.avatar_url} name={displayName} size={40} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <ThemedText style={styles.greetingHello}>
            {t('home.greeting', { name: firstName })}
          </ThemedText>
          <ThemedText style={styles.greetingEmail}>{session?.user.email}</ThemedText>
        </View>

        {/* ── Mock banner ── */}
        {IS_MOCK_MODE && (
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <SymbolView
                name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
                size={14}
                tintColor={TEXT}
              />
            </View>
            <View style={styles.bannerBody}>
              <ThemedText style={styles.bannerTitle}>Mock mode is ON</ThemedText>
              <ThemedText style={styles.bannerDesc}>
                Set EXPO_PUBLIC_USE_MOCK=false in .env to connect Supabase.
              </ThemedText>
            </View>
          </View>
        )}

        {/* ── Profile card ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionDot} />
          <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <LoadingSpinner />
          </View>
        ) : (
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <Avatar uri={profile?.avatar_url} name={displayName} size={52} />
              <View style={styles.profileMeta}>
                <ThemedText style={styles.profileName}>
                  {profile?.full_name ?? '—'}
                </ThemedText>
                <ThemedText style={styles.profileEmail}>{session?.user.email}</ThemedText>
              </View>
            </View>
            {profile?.bio ? (
              <>
                <View style={styles.divider} />
                <View style={styles.profileBioRow}>
                  <ThemedText style={styles.bioLabel}>Bio</ThemedText>
                  <ThemedText style={styles.bioValue} numberOfLines={3}>
                    {profile.bio}
                  </ThemedText>
                </View>
              </>
            ) : null}
          </View>
        )}

        {/* ── Stack grid ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionDot} />
          <ThemedText style={styles.sectionTitle}>What's wired up</ThemedText>
        </View>

        <View style={styles.grid}>
          {STACK.map((item) => (
            <StackCell key={item.label} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: DARK,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Scroll content
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },

  // Greeting
  greeting: { gap: 4 },
  greetingHello: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: -0.5,
  },
  greetingEmail: {
    fontSize: 13,
    color: MUTED,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: ACCENT + '30',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bannerBody: { flex: 1, gap: 2 },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: TEXT },
  bannerDesc: { fontSize: 12, color: MUTED, lineHeight: 17 },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: -4,
  },
  sectionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: ACCENT,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Loading card
  loadingCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  // Profile card
  profileCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileMeta: { flex: 1, gap: 3 },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  profileEmail: {
    fontSize: 12,
    color: MUTED,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  profileBioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    flexShrink: 0,
  },
  bioValue: {
    fontSize: 13,
    color: TEXT,
    flex: 1,
    textAlign: 'right',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '47.5%',
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cellIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: CHIP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: MUTED,
  },
  cellBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
    flexShrink: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    flexShrink: 0,
  },
});
