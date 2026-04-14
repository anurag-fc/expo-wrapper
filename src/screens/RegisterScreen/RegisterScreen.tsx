import { Link, useRouter } from 'expo-router';
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
import { useSignUp } from '@/queries/use-session';

// ─── Oracle theme ─────────────────────────────────────────────────────────────
const BG      = '#F7F5F2';
const CARD    = '#FFFFFF';
const TEXT    = '#2F2F2F';
const MUTED   = '#9E9E9E';
const BORDER  = '#E8E6E3';
const PRIMARY = '#A3B18A';
const DANGER  = '#EF4444';

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  error,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string | null;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, !!error && styles.fieldInputError]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={MUTED}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ─── RegisterScreen ───────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError]   = useState('');

  const { mutate: signUp, isPending, isSuccess, data } = useSignUp();

  const handleSignUp = () => {
    setPasswordError('');
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    signUp({ email: email.trim(), password });
  };

  // ── Confirmation state ────────────────────────────────────────────────────
  if (isSuccess && data?.data.needsConfirmation) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.confirmWrap}>
            <View style={styles.confirmIcon}>
              <SymbolView
                name={{ ios: 'envelope.open', android: 'mark_email_read', web: 'mark_email_read' }}
                size={28}
                tintColor={PRIMARY}
              />
            </View>

            <Text style={styles.confirmTitle}>Check your email</Text>
            <Text style={styles.confirmSub}>
              We've sent a confirmation link to{'\n'}
              <Text style={styles.confirmEmail}>{email}</Text>
            </Text>

            <Link href="/(auth)/login" asChild>
              <Pressable style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.8 }]}>
                <Text style={styles.signInBtnText}>Back to sign in</Text>
              </Pressable>
            </Link>
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
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Join Choice and start listening{'\n'}to your inner voice.
              </Text>
            </View>

            {/* ── Fields ── */}
            <View style={styles.form}>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                returnKeyType="next"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                returnKeyType="next"
              />
              <Field
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                error={passwordError}
              />

              {/* Sign up button */}
              <Pressable
                onPress={handleSignUp}
                disabled={isPending}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  isPending && { opacity: 0.8 },
                  pressed && !isPending && { opacity: 0.85 },
                ]}
              >
                {isPending
                  ? <LoadingSpinner />
                  : <Text style={styles.primaryBtnText}>Create account</Text>
                }
              </Pressable>
            </View>

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>

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

  // Back
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

  // Form
  form: { gap: 14 },

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
  fieldInputError: {
    borderColor: DANGER + '60',
    borderWidth: 1,
  },
  fieldError: {
    fontSize: 12,
    color: DANGER,
    marginLeft: 2,
  },

  // Primary button
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 2,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '300',
  },
  footerLink: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },

  // Confirmation state
  confirmWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 16,
  },
  confirmIcon: {
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
  confirmTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.3,
  },
  confirmSub: {
    fontSize: 14,
    fontWeight: '300',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmEmail: {
    color: TEXT,
    fontWeight: '500',
  },
  signInBtn: {
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
  signInBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT,
  },
});
