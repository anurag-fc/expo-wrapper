import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useResetPassword } from '@/queries/use-session';

// ─── Oracle theme ─────────────────────────────────────────────────────────────
const BG      = '#F7F5F2';
const CARD    = '#FFFFFF';
const TEXT    = '#2F2F2F';
const MUTED   = '#9E9E9E';
const BORDER  = '#E8E6E3';
const PRIMARY = '#A3B18A';

export default function ForgotPasswordScreen() {
  const router  = useRouter();
  const [email, setEmail] = useState('');

  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword();

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.successWrap}>
            {/* Icon */}
            <View style={styles.successIcon}>
              <SymbolView
                name={{ ios: 'envelope.open', android: 'mark_email_read', web: 'mark_email_read' }}
                size={28}
                tintColor={PRIMARY}
              />
            </View>

            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successSub}>
              We've sent a reset link to{'\n'}
              <Text style={styles.successEmail}>{email}</Text>
            </Text>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.backBtnText}>Back to sign in</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Back ── */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.6 }]}
            >
              <SymbolView
                name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                size={18}
                tintColor={MUTED}
              />
              <Text style={styles.backRowText}>Sign in</Text>
            </Pressable>

            {/* ── Header ── */}
            <View style={styles.header}>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you{'\n'}a link to reset your password.
              </Text>
            </View>

            {/* ── Email field ── */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={MUTED}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={() => email.trim() && resetPassword(email.trim())}
              />
            </View>

            {/* ── Send button ── */}
            <Pressable
              onPress={() => email.trim() && resetPassword(email.trim())}
              disabled={isPending || !email.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                (!email.trim() || isPending) && styles.sendBtnDisabled,
                pressed && email.trim() && { opacity: 0.82 },
              ]}
            >
              {isPending
                ? <LoadingSpinner />
                : <Text style={styles.sendBtnText}>Send reset link</Text>
              }
            </Pressable>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  safe:   { flex: 1 },
  flex:   { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 24,
  },

  // Back row
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backRowText: {
    fontSize: 15,
    color: MUTED,
    fontWeight: '400',
  },

  // Header
  header: { gap: 10 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: MUTED,
    lineHeight: 21,
  },

  // Field
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: MUTED,
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  fieldInput: {
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  // Send button
  sendBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#D6D6D2',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // Success state
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 16,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.3,
  },
  successSub: {
    fontSize: 14,
    fontWeight: '300',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: {
    color: TEXT,
    fontWeight: '500',
  },
  backBtn: {
    marginTop: 8,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT,
  },
});
