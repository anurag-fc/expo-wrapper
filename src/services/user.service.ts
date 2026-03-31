import AsyncStorage from '@react-native-async-storage/async-storage';

import { IS_MOCK_MODE } from '@/constants/config';
import { supabase } from '@/lib/supabase/client';
import type { Tables, UpdateTables } from '@/lib/supabase/types';
import { MOCK_PROFILE } from '@/mocks/data';
import { mockDelay } from '@/mocks/delay';

type ServiceResult<T> = Promise<{ data: T; error: Error | null }>;

const MOCK_PROFILE_KEY = 'mock_profile';

export const userService = {
  getProfile: async (userId: string): ServiceResult<Tables<'profiles'>> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      try {
        const stored = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
        const profile = stored ? (JSON.parse(stored) as Tables<'profiles'>) : MOCK_PROFILE;
        return { data: profile, error: null };
      } catch {
        return { data: MOCK_PROFILE, error: null };
      }
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data: data as Tables<'profiles'>, error: error as Error | null };
  },

  updateProfile: async (
    userId: string,
    updates: UpdateTables<'profiles'>,
  ): ServiceResult<Tables<'profiles'>> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      try {
        const stored = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
        const current = stored ? (JSON.parse(stored) as Tables<'profiles'>) : MOCK_PROFILE;
        const updated: Tables<'profiles'> = {
          ...current,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(updated));
        return { data: updated, error: null };
      } catch {
        return { data: MOCK_PROFILE, error: new Error('Failed to update mock profile.') };
      }
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    return { data: data as Tables<'profiles'>, error: error as Error | null };
  },
};
