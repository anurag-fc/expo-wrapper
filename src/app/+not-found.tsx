import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="title">404</ThemedText>
          <ThemedText themeColor="textSecondary">This screen does not exist.</ThemedText>
          <Link href="/(app)" style={styles.link}>
            <ThemedText type="linkPrimary">Go home</ThemedText>
          </Link>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  link: { marginTop: 8 },
});
