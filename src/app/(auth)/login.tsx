import { Link } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IS_MOCK_MODE } from '@/constants/config';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSignIn } from '@/queries/use-session';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: signIn, isPending, error } = useSignIn();
  const apiError = error ? (error as Error).message ?? t('auth.invalidCredentials') : null;

  const handleSignIn = () => {
    if (!email || !password) return;
    signIn({ email, password });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText type="title">{t('auth.signIn')}</ThemedText>
              {IS_MOCK_MODE ? (
                <ThemedView type="backgroundElement" style={styles.mockBadge}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('auth.mockBadge')} · {t('auth.mockHint')}
                  </ThemedText>
                </ThemedView>
              ) : null}
            </View>

            <View style={styles.form}>
              <Input
                label={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="hello@example.com"
              />
              <Input
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                error={apiError ?? undefined}
              />

              <Button onPress={handleSignIn} loading={isPending}>
                {t('auth.signIn')}
              </Button>

              <Link href="/(auth)/forgot-password">
                <ThemedText type="link" style={styles.centerText}>
                  {t('auth.forgotPassword')}
                </ThemedText>
              </Link>
            </View>

            <OAuthButtons />

            <View style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('auth.noAccount')}{' '}
              </ThemedText>
              <Link href="/(auth)/register">
                <ThemedText type="linkPrimary">
                  {t('auth.signUp')}
                </ThemedText>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  flex: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  mockBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  form: {
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  centerText: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
