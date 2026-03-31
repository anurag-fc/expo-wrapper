import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ fullscreen = false, size = 'large' }: LoadingSpinnerProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={theme.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullscreen: {
    flex: 1,
  },
});
