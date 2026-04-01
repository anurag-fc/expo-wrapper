import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IS_MOCK_MODE } from '@/constants/config';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';

export function OAuthButtons() {
  const { t } = useTranslation();

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (IS_MOCK_MODE) {
      Alert.alert(
        'Mock Mode',
        `${provider === 'google' ? 'Google' : 'Apple'} OAuth is not available in mock mode.\n\nUse: demo@example.com / demo123`,
      );
      return;
    }
    const { error } = await authService.signInWithOAuth(provider);
    if (error) Alert.alert('Sign in failed', error.message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.orText}>
          {t('common.or')}
        </ThemedText>
        <View style={styles.line} />
      </View>

      <Button onPress={() => handleOAuth('google')} variant="secondary">
        {t('auth.continueWithGoogle')}
      </Button>

      <Button onPress={() => handleOAuth('apple')} variant="secondary">
        {t('auth.continueWithApple')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    alignSelf: 'stretch',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
  },
  orText: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
