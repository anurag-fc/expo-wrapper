import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore has a 2048-byte limit per value on Android.
// JWTs regularly exceed this, so large values spill to AsyncStorage
// while a pointer key in SecureStore tells us where to look.
const LARGE_VALUE_THRESHOLD = 1800;

export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      const pointer = await SecureStore.getItemAsync(`ptr_${key}`);
      if (pointer === 'async') {
        return AsyncStorage.getItem(key);
      }
      return SecureStore.getItemAsync(key);
    } catch {
      return AsyncStorage.getItem(key);
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    try {
      if (value.length > LARGE_VALUE_THRESHOLD) {
        await AsyncStorage.setItem(key, value);
        await SecureStore.setItemAsync(`ptr_${key}`, 'async');
      } else {
        await SecureStore.setItemAsync(key, value);
        await SecureStore.setItemAsync(`ptr_${key}`, 'secure');
      }
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
      await SecureStore.deleteItemAsync(key).catch(() => null);
      await SecureStore.deleteItemAsync(`ptr_${key}`).catch(() => null);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};
