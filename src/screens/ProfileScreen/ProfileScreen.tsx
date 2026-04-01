import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BottomTabInset, Spacing } from '@/constants/theme';
import i18n from '@/lib/i18n';
import { useProfile, useUpdateProfile } from '@/queries/use-profile';
import { useSignOut } from '@/queries/use-session';

// ─── Tokens (same as HomeScreen) ─────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const CHIP   = '#EFEDE8';
const DARK   = '#1C1C1E';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const ACCENT = '#F5C533';
const BORDER = '#E5E2DA';
const DANGER = '#EF4444';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  const [fullName, setFullName] = useState('');
  const [bio, setBio]           = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setBio(profile.bio ?? '');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile(
      { full_name: fullName, bio },
      { onSuccess: () => Alert.alert('', t('profile.updateSuccess')) },
    );
  };

  const handleSignOut = () => {
    Alert.alert(t('auth.signOut'), 'Are you sure?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const displayName = profile?.full_name ?? profile?.email ?? '…';

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>Profile</ThemedText>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >

        {/* ── Hero avatar ── */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <Avatar uri={profile?.avatar_url} name={displayName} size={72} />
            <View style={styles.avatarBadge}>
              <SymbolView
                name={{ ios: 'person.crop.circle.badge.checkmark', android: 'verified_user', web: 'verified_user' }}
                size={13}
                tintColor={TEXT}
              />
            </View>
          </View>
          <View style={styles.heroText}>
            <ThemedText style={styles.heroName}>{displayName}</ThemedText>
            <ThemedText style={styles.heroEmail}>{profile?.email}</ThemedText>
          </View>
        </View>

        {/* ── Edit section ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionDot} />
          <ThemedText style={styles.sectionTitle}>Edit info</ThemedText>
        </View>

        <View style={styles.card}>
          {/* Name field */}
          <View style={styles.fieldWrap}>
            <View style={styles.fieldHeader}>
              <SymbolView
                name={{ ios: 'person', android: 'person', web: 'person' }}
                size={13}
                tintColor={MUTED}
              />
              <ThemedText style={styles.fieldLabel}>{t('profile.fullName')}</ThemedText>
            </View>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={MUTED}
              autoCorrect={false}
            />
          </View>

          <View style={styles.divider} />

          {/* Bio field */}
          <View style={styles.fieldWrap}>
            <View style={styles.fieldHeader}>
              <SymbolView
                name={{ ios: 'text.alignleft', android: 'notes', web: 'notes' }}
                size={13}
                tintColor={MUTED}
              />
              <ThemedText style={styles.fieldLabel}>{t('profile.bio')}</ThemedText>
            </View>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={bio}
              onChangeText={setBio}
              placeholder="A short bio"
              placeholderTextColor={MUTED}
              multiline
              numberOfLines={3}
              autoCorrect={false}
            />
          </View>

          <View style={styles.divider} />

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [styles.saveBtn, { opacity: isSaving || pressed ? 0.7 : 1 }]}
          >
            {isSaving ? (
              <LoadingSpinner />
            ) : (
              <>
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={14}
                  tintColor={TEXT}
                />
                <ThemedText style={styles.saveBtnText}>{t('profile.saveChanges')}</ThemedText>
              </>
            )}
          </Pressable>
        </View>

        {/* ── Language section ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionDot} />
          <ThemedText style={styles.sectionTitle}>{t('profile.changeLanguage')}</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.langRow}>
            {(['en', 'es'] as const).map((lang) => {
              const active = i18n.language === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => i18n.changeLanguage(lang)}
                  style={[styles.langBtn, active && styles.langBtnActive]}
                >
                  <ThemedText style={[styles.langBtnText, active && styles.langBtnTextActive]}>
                    {t(`profile.language_${lang}`)}
                  </ThemedText>
                  {active && <View style={styles.langActiveDot} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Sign out ── */}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={({ pressed }) => [styles.signOutBtn, { opacity: isSigningOut || pressed ? 0.7 : 1 }]}
        >
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            size={15}
            tintColor={DANGER}
          />
          <ThemedText style={styles.signOutText}>{t('auth.signOut')}</ThemedText>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: DARK,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT },
  statusText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  // Scroll
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.two,
  },
  avatarWrap: { position: 'relative' },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BG,
  },
  heroText: { alignItems: 'center', gap: 4 },
  heroName: { fontSize: 20, fontWeight: '700', color: TEXT, letterSpacing: -0.3 },
  heroEmail: { fontSize: 13, color: MUTED },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: -4,
  },
  sectionDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: ACCENT },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER, marginHorizontal: 16 },

  // Fields
  fieldWrap: { padding: 16, gap: 8 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT,
    backgroundColor: CHIP,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 11,
  },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 13,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: TEXT },

  // Language
  langRow: { flexDirection: 'row', padding: 10, gap: 8 },
  langBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: CHIP,
  },
  langBtnActive: { backgroundColor: DARK },
  langBtnText: { fontSize: 14, fontWeight: '600', color: MUTED },
  langBtnTextActive: { color: '#FFFFFF' },
  langActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CARD,
    borderRadius: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: DANGER + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  signOutText: { fontSize: 14, fontWeight: '600', color: DANGER },
});
