import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bgColor = {
    primary: theme.text,
    secondary: theme.backgroundElement,
    ghost: 'transparent',
    destructive: '#EF4444',
  }[variant];

  const textColor = {
    primary: theme.background,
    secondary: theme.text,
    ghost: theme.text,
    destructive: '#ffffff',
  }[variant];

  const paddingVertical = { sm: Spacing.one, md: Spacing.two, lg: Spacing.three }[size];
  const paddingHorizontal = { sm: Spacing.three, md: Spacing.four, lg: Spacing.five }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bgColor,
          paddingVertical,
          paddingHorizontal,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontWeight: '600',
  },
});
