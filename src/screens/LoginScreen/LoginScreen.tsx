import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  Alert,
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

import { IS_MOCK_MODE } from '@/constants/config';
import { authService } from '@/services/auth.service';
import { useSignIn } from '@/queries/use-session';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ─── Oracle theme ─────────────────────────────────────────────────────────────
const BG      = '#F7F5F2';
const CARD    = '#FFFFFF';
const TEXT    = '#2F2F2F';
const MUTED   = '#9E9E9E';
const CHIP    = '#EFEFEC';
const PRIMARY = '#A3B18A';
const DANGER  = '#EF4444';
const BORDER  = '#E8E6E3';

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

// ─── LoginScreen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const { mutate: signIn, isPending } = useSignIn();

  const handleSignIn = () => {
    if (!email.trim() || !password) return;
    setAuthError(null);
    signIn(
      { email: email.trim(), password },
      {
        onSuccess: (result) => {
          if (result.error) {
            setAuthError(result.error.message ?? 'Invalid email or password.');
          }
        },
        onError: (err) => {
          setAuthError((err as Error).message ?? 'Something went wrong. Please try again.');
        },
      },
    );
  };

  const handleGoogle = async () => {
    if (IS_MOCK_MODE) {
      Alert.alert(
        'Mock mode',
        'Google sign-in unavailable in mock mode.\n\nUse: demo@example.com / demo123',
      );
      return;
    }
    const { error: oauthErr } = await authService.signInWithOAuth('google');
    if (oauthErr) Alert.alert('Sign in failed', oauthErr.message);
  };

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

            {/* ── Brand ── */}
            <View style={styles.brand}>
              <View style={styles.iconWrap}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                  size={28}
                  tintColor={PRIMARY}
                />
              </View>
              <Text style={styles.appName}>Choice</Text>
              <Text style={styles.tagline}>A calm space to hear your own answer.</Text>
            </View>

            {/* ── Form ── */}
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
                onChangeText={(v) => { setPassword(v); setAuthError(null); }}
                placeholder="••••••••"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                error={authError}
              />

              {/* Sign in button */}
              <Pressable
                onPress={handleSignIn}
                disabled={isPending}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  (isPending || pressed) && { opacity: 0.8 },
                ]}
              >
                {isPending
                  ? <LoadingSpinner />
                  : <Text style={styles.primaryBtnText}>Sign in</Text>
                }
              </Pressable>

              {/* Forgot password */}
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable style={styles.forgotWrap}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </Link>
            </View>

            {/* ── Divider ── */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Google ── */}
            <Pressable
              onPress={handleGoogle}
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.82 }]}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleLabel}>Continue with Google</Text>
            </Pressable>

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Sign up</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
    gap: 20,
  },

  // Brand
  brand: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 2,
  },
  appName: {
    fontSize: 30,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '300',
    color: MUTED,
    textAlign: 'center',
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

  // Forgot
  forgotWrap: { alignItems: 'center' },
  forgotText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '400',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  dividerText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  googleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CHIP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
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
});
