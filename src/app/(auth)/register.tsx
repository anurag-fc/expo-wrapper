import { Link } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSignUp } from '@/queries/use-session';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { mutate: signUp, isPending, isSuccess, data } = useSignUp();

  const handleSignUp = () => {
    setPasswordError('');
    if (password !== confirmPassword) {
      setPasswordError(t('auth.passwordMismatch'));
      return;
    }
    signUp({ email, password });
  };

  const needsConfirmation = isSuccess && data?.data.needsConfirmation;

  if (needsConfirmation) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.confirmation}>
            <ThemedText type="title">{t('auth.checkEmail')}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {t('auth.checkEmailBody', { email })}
            </ThemedText>
            <Link href="/(auth)/login" asChild>
              <ThemedText type="linkPrimary">{t('auth.signIn')}</ThemedText>
            </Link>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

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
            <ThemedText type="title" style={styles.centerText}>
              {t('auth.signUp')}
            </ThemedText>

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
              />
              <Input
                label={t('auth.confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="••••••••"
                error={passwordError}
              />

              <Button onPress={handleSignUp} loading={isPending}>
                {t('auth.signUp')}
              </Button>
            </View>

            <View style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('auth.hasAccount')}{' '}
              </ThemedText>
              <Link href="/(auth)/login">
                <ThemedText type="linkPrimary">
                  {t('auth.signIn')}
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
  form: {
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  centerText: {
    textAlign: 'center',
  },
  confirmation: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
