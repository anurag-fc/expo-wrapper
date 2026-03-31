import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/queries/use-session';

import { styles } from './ForgotPasswordScreen.styles';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');

  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword();

  if (isSuccess) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <ThemedText type="title">{t('auth.checkEmail')}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {t('auth.resetEmailSent')}
            </ThemedText>
            <Button onPress={() => router.back()} variant="secondary">
              {t('common.back')}
            </Button>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ThemedText type="title">{t('auth.resetPassword')}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Enter your email and we&apos;ll send you a reset link.
          </ThemedText>
          <View style={styles.form}>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="hello@example.com"
            />
            <Button onPress={() => resetPassword(email)} loading={isPending}>
              {t('auth.sendResetLink')}
            </Button>
            <Button onPress={() => router.back()} variant="ghost">
              {t('common.back')}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
