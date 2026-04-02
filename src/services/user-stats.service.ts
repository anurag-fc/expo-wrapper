import AsyncStorage from '@react-native-async-storage/async-storage';

import { IS_MOCK_MODE } from '@/constants/config';
import { XP_PER_LEVEL, xpToLevel } from '@/constants/skills';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { MOCK_USER_STATS } from '@/mocks/data';
import { mockDelay } from '@/mocks/delay';

type ServiceResult<T> = Promise<{ data: T; error: Error | null }>;

// ─── Timezone-aware date helpers ──────────────────────────────────────────────
function toLocalDateStr(utcTs: string, timezone: string): string {
  try {
    return new Date(utcTs).toLocaleDateString('en-CA', { timeZone: timezone });
  } catch {
    return utcTs.split('T')[0];
  }
}

function todayStr(timezone: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function yesterdayStr(timezone: string): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  try {
    return d.toLocaleDateString('en-CA', { timeZone: timezone });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

// ─── Mock persistence ─────────────────────────────────────────────────────────
const MOCK_USER_STATS_KEY = 'mock_user_stats';

async function getMockStats(): Promise<Tables<'user_stats'>> {
  try {
    const stored = await AsyncStorage.getItem(MOCK_USER_STATS_KEY);
    return stored ? (JSON.parse(stored) as Tables<'user_stats'>) : { ...MOCK_USER_STATS };
  } catch {
    return { ...MOCK_USER_STATS };
  }
}

async function saveMockStats(stats: Tables<'user_stats'>): Promise<void> {
  await AsyncStorage.setItem(MOCK_USER_STATS_KEY, JSON.stringify(stats));
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const userStatsService = {
  getUserStats: async (userId: string): ServiceResult<Tables<'user_stats'>> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return { data: await getMockStats(), error: null };
    }

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return { data: null as unknown as Tables<'user_stats'>, error: error as Error };
    return { data: data as Tables<'user_stats'>, error: null };
  },

  addXP: async (userId: string, amount: number): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      const stats   = await getMockStats();
      const newXP   = stats.xp + amount;
      const newLevel = xpToLevel(newXP);
      await saveMockStats({ ...stats, xp: newXP, level: newLevel });
      return { data: undefined, error: null };
    }

    // Use Supabase RPC to atomically increment XP and recalculate level
    const { data: current, error: fetchError } = await supabase
      .from('user_stats')
      .select('xp')
      .eq('user_id', userId)
      .single();
    if (fetchError) return { data: undefined, error: fetchError as Error };

    const newXP    = (current?.xp ?? 0) + amount;
    const newLevel = xpToLevel(newXP);

    const { error } = await supabase
      .from('user_stats')
      .update({ xp: newXP, level: newLevel })
      .eq('user_id', userId);

    if (error) return { data: undefined, error: error as Error };
    return { data: undefined, error: null };
  },

  updateStreak: async (userId: string, timezone: string): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      const stats  = await getMockStats();
      const today  = todayStr(timezone);
      const yesterday = yesterdayStr(timezone);
      const lastDay   = stats.last_logged_at
        ? toLocalDateStr(stats.last_logged_at, timezone)
        : null;

      if (lastDay === today) {
        // Already logged today — no change
        return { data: undefined, error: null };
      }

      const newStreak = lastDay === yesterday
        ? stats.current_streak + 1   // extend streak
        : 1;                          // reset

      const longestStreak = Math.max(newStreak, stats.longest_streak);

      await saveMockStats({
        ...stats,
        current_streak:  newStreak,
        longest_streak:  longestStreak,
        last_logged_at:  new Date().toISOString(),
        timezone,
      });
      return { data: undefined, error: null };
    }

    const { data: current, error: fetchError } = await supabase
      .from('user_stats')
      .select('current_streak, longest_streak, last_logged_at, timezone')
      .eq('user_id', userId)
      .single();
    if (fetchError) return { data: undefined, error: fetchError as Error };

    const tz         = current?.timezone ?? timezone;
    const today      = todayStr(tz);
    const yesterday  = yesterdayStr(tz);
    const lastDay    = current?.last_logged_at
      ? toLocalDateStr(current.last_logged_at, tz)
      : null;

    if (lastDay === today) return { data: undefined, error: null };

    const newStreak     = lastDay === yesterday ? (current?.current_streak ?? 0) + 1 : 1;
    const longestStreak = Math.max(newStreak, current?.longest_streak ?? 0);

    const { error } = await supabase
      .from('user_stats')
      .update({
        current_streak:  newStreak,
        longest_streak:  longestStreak,
        last_logged_at:  new Date().toISOString(),
        timezone,
      })
      .eq('user_id', userId);

    if (error) return { data: undefined, error: error as Error };
    return { data: undefined, error: null };
  },

  rateSkill: async (userId: string, amount: number): ServiceResult<void> => {
    // Convenience wrapper — rating a skill earns 5 XP
    return userStatsService.addXP(userId, amount);
  },
};
