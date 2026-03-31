import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useIsAuthReady } from '@/queries/use-session';

const SPLASH_DURATION = 1500;

// Prevent the native splash from auto-hiding — we control when it hides.
SplashScreen.preventAutoHideAsync();

export function AppSplashScreen({ children }: { children: React.ReactNode }) {
  const isReady = useIsAuthReady();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      setVisible(false);
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [isReady]);

  if (visible) {
    return (
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 76,
    height: 76,
  },
});
