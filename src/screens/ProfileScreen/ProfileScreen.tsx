import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CATEGORY_MAP, xpProgressInLevel } from '@/constants/skills';
import { Accent, BottomTabInset, Primary, Spacing } from '@/constants/theme';
import i18n from '@/lib/i18n';
import { useProfile, useUpdateProfile } from '@/queries/use-profile';
import { useSignOut } from '@/queries/use-session';
import { useSkills } from '@/queries/use-skills';
import { useUserStats } from '@/queries/use-user-stats';
import { getSkillProgress } from '@/services/skills.service';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const CHIP   = '#F0EEE9';
const DARK   = '#1C1C1E';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const BORDER = '#E8E5DF';
const DANGER = '#EF4444';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isLoading }          = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: signOut, isPending: isSigningOut }   = useSignOut();
  const { data: userStats }                   = useUserStats();
  const { data: skills }                      = useSkills();

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

  const displayName   = profile?.full_name ?? profile?.email ?? '…';
  const completedSkills = (skills ?? []).filter((s) => s.skill_stats?.is_completed);
  const xpInfo        = userStats ? xpProgressInLevel(userStats.xp) : null;

  if (isLoading) {
    return <View style={[styles.screen, styles.center]}><LoadingSpinner /></View>;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']}>
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
        {/* ── Hero ── */}
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

        {/* ── Stats row ── */}
        {userStats && (
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <ThemedText style={styles.statValue}>🔥 {userStats.current_streak}</ThemedText>
              <ThemedText style={styles.statLabel}>Streak</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <ThemedText style={styles.statValue}>{completedSkills.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Completed</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <ThemedText style={styles.statValue}>{userStats.xp}</ThemedText>
              <ThemedText style={styles.statLabel}>Total XP</ThemedText>
            </View>
          </View>
        )}

        {/* ── XP bar ── */}
        {xpInfo && userStats && (
          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <ThemedText style={styles.xpLabel}>Level {userStats.level}</ThemedText>
              <ThemedText style={styles.xpSub}>{xpInfo.current} / {xpInfo.total} XP</ThemedText>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${xpInfo.pct}%` as `${number}%` }]} />
            </View>
            <ThemedText style={styles.xpNext}>{xpInfo.total - xpInfo.current} XP to Level {userStats.level + 1}</ThemedText>
          </View>
        )}

        {/* ── Edit info ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionDot} />
          <ThemedText style={styles.sectionTitle}>Edit info</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldWrap}>
            <View style={styles.fieldHeader}>
              <SymbolView name={{ ios: 'person', android: 'person', web: 'person' }} size={13} tintColor={MUTED} />
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

          <View style={styles.fieldWrap}>
            <View style={styles.fieldHeader}>
              <SymbolView name={{ ios: 'text.alignleft', android: 'notes', web: 'notes' }} size={13} tintColor={MUTED} />
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

          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [styles.saveBtn, { opacity: isSaving || pressed ? 0.7 : 1 }]}
          >
            {isSaving ? <LoadingSpinner /> : (
              <>
                <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} tintColor={TEXT} />
                <ThemedText style={styles.saveBtnText}>{t('profile.saveChanges')}</ThemedText>
              </>
            )}
          </Pressable>
        </View>

        {/* ── Language ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionDot} />
          <ThemedText style={styles.sectionTitle}>{t('profile.changeLanguage')}</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.langRow}>
            {(['en', 'es', 'hi'] as const).map((lang) => {
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

        {/* ── Completed Skills ── */}
        {completedSkills.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <View style={styles.sectionDot} />
              <ThemedText style={styles.sectionTitle}>Completed Skills</ThemedText>
            </View>
            <View style={styles.card}>
              {completedSkills.map((skill, i) => {
                const cat = CATEGORY_MAP[skill.category as keyof typeof CATEGORY_MAP];
                const rating = skill.skill_stats?.star_rating ?? 0;
                return (
                  <View key={skill.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={styles.completedRow}>
                      <View style={[styles.completedDot, { backgroundColor: cat?.color ?? MUTED }]} />
                      <View style={styles.completedMeta}>
                        <ThemedText style={styles.completedName}>{skill.name}</ThemedText>
                        <ThemedText style={styles.completedSource}>{skill.source ?? cat?.label}</ThemedText>
                      </View>
                      <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <ThemedText key={star} style={[styles.star, star <= rating && styles.starFilled]}>
                            ★
                          </ThemedText>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  center: { alignItems: 'center', justifyContent: 'center' },

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
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Accent },
  statusText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },

  // Hero
  hero: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  avatarWrap: { position: 'relative' },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: BG,
  },
  heroText:  { alignItems: 'center', gap: 4 },
  heroName:  { fontSize: 20, fontWeight: '700', color: TEXT, letterSpacing: -0.3 },
  heroEmail: { fontSize: 13, color: MUTED },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCell:    { flex: 1, alignItems: 'center', gap: 4 },
  statValue:   { fontSize: 18, fontWeight: '700', color: TEXT },
  statLabel:   { fontSize: 11, color: MUTED, fontWeight: '500' },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: BORDER },

  // XP card
  xpCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  xpHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpLabel:  { fontSize: 14, fontWeight: '700', color: TEXT },
  xpSub:    { fontSize: 12, color: MUTED },
  xpTrack:  {
    height: 6, backgroundColor: BORDER,
    borderRadius: 3, overflow: 'hidden',
  },
  xpFill:   { height: 6, backgroundColor: Primary, borderRadius: 3 },
  xpNext:   { fontSize: 12, color: MUTED },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: -4,
  },
  sectionDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Accent },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: MUTED,
    textTransform: 'uppercase', letterSpacing: 0.8,
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
  fieldWrap:   { padding: 16, gap: 8 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel:  { fontSize: 12, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontSize: 15, fontWeight: '500', color: TEXT,
    backgroundColor: CHIP, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 11 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, backgroundColor: Accent,
    borderRadius: 14, paddingVertical: 13,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: TEXT },

  // Language
  langRow: { flexDirection: 'row', padding: 10, gap: 8 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: CHIP,
  },
  langBtnActive: { backgroundColor: DARK },
  langBtnText:   { fontSize: 14, fontWeight: '600', color: MUTED },
  langBtnTextActive: { color: '#FFFFFF' },
  langActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Accent },

  // Completed skills
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  completedDot:  { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  completedMeta: { flex: 1, gap: 2 },
  completedName: { fontSize: 14, fontWeight: '600', color: TEXT },
  completedSource: { fontSize: 12, color: MUTED },
  stars:         { flexDirection: 'row', gap: 1 },
  star:          { fontSize: 14, color: BORDER },
  starFilled:    { color: Accent },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: CARD, borderRadius: 20,
    paddingVertical: 15, borderWidth: 1, borderColor: DANGER + '30',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  signOutText: { fontSize: 14, fontWeight: '600', color: DANGER },
});
