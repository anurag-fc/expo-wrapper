import AsyncStorage from '@react-native-async-storage/async-storage';

import { IS_MOCK_MODE } from '@/constants/config';
import { XP_RULES } from '@/constants/skills';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { MOCK_PROGRESS_LOGS } from '@/mocks/data';
import { mockDelay } from '@/mocks/delay';
import { skillsService } from './skills.service';
import { userStatsService } from './user-stats.service';

type ServiceResult<T> = Promise<{ data: T; error: Error | null }>;

// ─── Mock persistence ─────────────────────────────────────────────────────────
const MOCK_LOGS_KEY = 'mock_progress_logs';

async function getMockLogs(): Promise<Tables<'progress_logs'>[]> {
  try {
    const stored = await AsyncStorage.getItem(MOCK_LOGS_KEY);
    return stored ? (JSON.parse(stored) as Tables<'progress_logs'>[]) : MOCK_PROGRESS_LOGS;
  } catch {
    return MOCK_PROGRESS_LOGS;
  }
}

async function saveMockLogs(logs: Tables<'progress_logs'>[]): Promise<void> {
  await AsyncStorage.setItem(MOCK_LOGS_KEY, JSON.stringify(logs));
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const progressService = {
  /**
   * Returns all logs between two ISO date strings (inclusive).
   * Used by the weekly calendar strip — pass 7-day window.
   */
  getProgressLogs: async (
    userId: string,
    from: string,
    to: string,
  ): ServiceResult<Tables<'progress_logs'>[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const logs = await getMockLogs();
      const data = logs.filter(
        (l) => l.user_id === userId && l.logged_at >= from && l.logged_at <= to,
      );
      return { data, error: null };
    }

    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', from)
      .lte('logged_at', to)
      .order('logged_at', { ascending: false });

    if (error) return { data: [], error: error as Error };
    return { data: (data ?? []) as Tables<'progress_logs'>[], error: null };
  },

  /**
   * Core action: log lessons done for a skill.
   * Also updates skill_stats, XP, and streak in one call.
   */
  logProgress: async (
    userId: string,
    skillId: string,
    lessonsDone: number,
    timezone: string,
  ): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay(400);

      // 1. Append log
      const logs = await getMockLogs();
      const newLog: Tables<'progress_logs'> = {
        id: `log-${Date.now()}`,
        user_id: userId,
        skill_id: skillId,
        lessons_done: lessonsDone,
        logged_at: new Date().toISOString(),
      };
      await saveMockLogs([newLog, ...logs]);

      // 2. Recalculate skill stats
      const allLogs = [newLog, ...logs].filter((l) => l.skill_id === skillId);
      const totalDone = allLogs.reduce((sum, l) => sum + l.lessons_done, 0);

      // Get skill to find total_lessons
      const { data: skillsData } = await skillsService.getSkills(userId);
      const skill = skillsData.find((s) => s.id === skillId);
      const isNowComplete = skill ? totalDone >= skill.total_lessons : false;
      const wasComplete   = skill?.skill_stats?.is_completed ?? false;

      await skillsService.updateSkillStat(skillId, {
        completed_lessons: totalDone,
        is_completed:      isNowComplete,
        completed_at:      isNowComplete && !wasComplete ? new Date().toISOString() : (skill?.skill_stats?.completed_at ?? null),
      });

      // 3. Add XP
      const xpEarned = lessonsDone * XP_RULES.LOG_LESSON +
                       (isNowComplete && !wasComplete ? XP_RULES.COMPLETE_SKILL : 0);
      await userStatsService.addXP(userId, xpEarned);

      // 4. Update streak
      await userStatsService.updateStreak(userId, timezone);

      return { data: undefined, error: null };
    }

    // ── Real mode ──────────────────────────────────────────────────────────────
    // 1. Insert log
    const { error: logError } = await supabase.from('progress_logs').insert({
      user_id: userId,
      skill_id: skillId,
      lessons_done: lessonsDone,
    });
    if (logError) return { data: undefined, error: logError as Error };

    // 2. Recalculate completed_lessons from all logs for this skill
    const { data: logsData, error: logsError } = await supabase
      .from('progress_logs')
      .select('lessons_done')
      .eq('skill_id', skillId);
    if (logsError) return { data: undefined, error: logsError as Error };

    const totalDone = (logsData ?? []).reduce((sum, l) => sum + l.lessons_done, 0);

    // 3. Get skill to check total_lessons and current stats
    const { data: rawSkill, error: skillError } = await supabase
      .from('skills')
      .select('total_lessons, skill_stats(*)')
      .eq('id', skillId)
      .single();
    if (skillError) return { data: undefined, error: skillError as Error };

    const skillData = rawSkill as unknown as {
      total_lessons: number;
      skill_stats: Tables<'skill_stats'> | null;
    } | null;

    const isNowComplete = totalDone >= (skillData?.total_lessons ?? 1);
    const wasComplete   = skillData?.skill_stats?.is_completed ?? false;

    // 4. Update skill_stats
    const { error: statsError } = await supabase
      .from('skill_stats')
      .update({
        completed_lessons: totalDone,
        is_completed:      isNowComplete,
        completed_at:      isNowComplete && !wasComplete ? new Date().toISOString() : undefined,
      })
      .eq('skill_id', skillId);
    if (statsError) return { data: undefined, error: statsError as Error };

    // 5. Add XP
    const xpEarned = lessonsDone * XP_RULES.LOG_LESSON +
                     (isNowComplete && !wasComplete ? XP_RULES.COMPLETE_SKILL : 0);
    await userStatsService.addXP(userId, xpEarned);

    // 6. Update streak
    await userStatsService.updateStreak(userId, timezone);

    return { data: undefined, error: null };
  },
};
