import Constants from 'expo-constants';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProfile, useUpdateProfile } from '@/queries/use-profile';
import { useSignOut } from '@/queries/use-session';

// ─── Design tokens (oracle theme) ────────────────────────────────────────────
const BG = '#F7F5F2';
const CARD = '#FFFFFF';
const PRIMARY = '#A3B18A'; // sage green
const TEXT = '#2F2F2F';
const MUTED = '#9E9E9E';
const BORDER = '#EBEBEB';
const CHIP = '#F2F0ED';
const DANGER = '#EF4444';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

// ─── Replace with your real URLs ──────────────────────────────────────────────
const TERMS_URL = 'https://docs.google.com/document/d/1n-ax51kbcNRlw6bQP8IQtEwu34dxEX0xRY1VulWpmiI/edit?usp=sharing';
const PRIVACY_URL = 'https://docs.google.com/document/d/1qFrpHWYVPGue0tM3j_wVMLeocF5Gjk2eNKO6vTWocuc/edit?usp=sharing';

// ─── Reusable row ─────────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  onPress,
  showChevron = false,
  isLast = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}) {
  const inner = (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {showChevron && (
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={13}
            tintColor={MUTED}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (profile) setFullName(profile.full_name ?? '');
  }, [profile]);

  const isDirty = fullName !== (profile?.full_name ?? '');

  const handleSave = () => {
    if (!isDirty) return;
    updateProfile(
      { full_name: fullName },
      { onSuccess: () => Alert.alert('Saved', 'Your name has been updated.') },
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 72 + 24 },
        ]}
      >

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <View style={styles.card}>

          {/* Name */}
          <View style={[styles.fieldWrap, styles.rowBorder]}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={MUTED}
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>

          {/* Email — read-only */}
          <InfoRow
            label="Email"
            value={profile?.email ?? '—'}
            isLast
          />

        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving || !isDirty}
          style={({ pressed }) => [
            styles.saveBtn,
            (!isDirty || isSaving) && styles.saveBtnDisabled,
            pressed && isDirty && { opacity: 0.85 },
          ]}
        >
          {isSaving ? (
            <LoadingSpinner />
          ) : (
            <Text style={styles.saveBtnText}>Save changes</Text>
          )}
        </Pressable>

        {/* ── About ───────────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>ABOUT</Text>

        <View style={styles.card}>
          <InfoRow
            label="App version"
            value={APP_VERSION}
          />
          <InfoRow
            label="Terms & Conditions"
            showChevron
            onPress={() => Linking.openURL(TERMS_URL)}
          />
          <InfoRow
            label="Privacy Policy"
            showChevron
            onPress={() => Linking.openURL(PRIVACY_URL)}
            isLast
          />
        </View>

        {/* ── Sign out ────────────────────────────────────────────────────── */}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={({ pressed }) => [styles.signOutBtn, { opacity: isSigningOut || pressed ? 0.7 : 1 }]}
        >
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            size={16}
            tintColor={DANGER}
          />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  center: { alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.4,
  },

  content: {
    paddingHorizontal: 20,
    gap: 10,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 0.9,
    marginBottom: 2,
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },

  // Row (used in InfoRow)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '300',
  },

  // Name field (editable row)
  fieldWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT,
    backgroundColor: CHIP,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // Save button
  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: CHIP,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DANGER + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '500',
    color: DANGER,
  },
});
