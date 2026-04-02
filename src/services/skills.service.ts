import AsyncStorage from '@react-native-async-storage/async-storage';

import { IS_MOCK_MODE } from '@/constants/config';
import { supabase } from '@/lib/supabase/client';
import type { InsertTables, Tables } from '@/lib/supabase/types';
import { MOCK_SKILL_STATS, MOCK_SKILLS, MOCK_USER } from '@/mocks/data';
import { mockDelay } from '@/mocks/delay';

type ServiceResult<T> = Promise<{ data: T; error: Error | null }>;

// ─── Joined type used throughout the app ─────────────────────────────────────
export type SkillWithStats = Tables<'skills'> & {
  skill_stats: Tables<'skill_stats'> | null;
};

export function getSkillProgress(skill: SkillWithStats): number {
  if (!skill.skill_stats || skill.total_lessons === 0) return 0;
  return Math.min(
    100,
    Math.round((skill.skill_stats.completed_lessons / skill.total_lessons) * 100),
  );
}

// ─── Mock persistence ─────────────────────────────────────────────────────────
const MOCK_SKILLS_KEY      = 'mock_skills';
const MOCK_SKILL_STATS_KEY = 'mock_skill_stats';

async function getMockSkills(): Promise<Tables<'skills'>[]> {
  try {
    const stored = await AsyncStorage.getItem(MOCK_SKILLS_KEY);
    return stored ? (JSON.parse(stored) as Tables<'skills'>[]) : MOCK_SKILLS;
  } catch {
    return MOCK_SKILLS;
  }
}

async function getMockSkillStats(): Promise<Tables<'skill_stats'>[]> {
  try {
    const stored = await AsyncStorage.getItem(MOCK_SKILL_STATS_KEY);
    return stored ? (JSON.parse(stored) as Tables<'skill_stats'>[]) : MOCK_SKILL_STATS;
  } catch {
    return MOCK_SKILL_STATS;
  }
}

async function saveMockSkills(skills: Tables<'skills'>[]): Promise<void> {
  await AsyncStorage.setItem(MOCK_SKILLS_KEY, JSON.stringify(skills));
}

async function saveMockSkillStats(stats: Tables<'skill_stats'>[]): Promise<void> {
  await AsyncStorage.setItem(MOCK_SKILL_STATS_KEY, JSON.stringify(stats));
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const skillsService = {
  getSkills: async (userId: string): ServiceResult<SkillWithStats[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const skills = await getMockSkills();
      const stats  = await getMockSkillStats();
      const data: SkillWithStats[] = skills
        .filter((s) => s.user_id === userId)
        .map((s) => ({
          ...s,
          skill_stats: stats.find((st) => st.skill_id === s.id) ?? null,
        }));
      return { data, error: null };
    }

    const { data, error } = await supabase
      .from('skills')
      .select('*, skill_stats(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error as Error };
    return { data: (data ?? []) as SkillWithStats[], error: null };
  },

  addSkill: async (
    userId: string,
    payload: Omit<InsertTables<'skills'>, 'user_id'>,
  ): ServiceResult<SkillWithStats> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const newSkill: Tables<'skills'> = {
        id: `mock-skill-${Date.now()}`,
        user_id: userId,
        name: payload.name,
        category: payload.category,
        source: payload.source ?? null,
        total_lessons: payload.total_lessons ?? 1,
        goal_date: payload.goal_date ?? null,
        created_at: new Date().toISOString(),
      };
      const newStat: Tables<'skill_stats'> = {
        skill_id: newSkill.id,
        completed_lessons: 0,
        is_completed: false,
        completed_at: null,
        star_rating: null,
      };
      const skills = await getMockSkills();
      const stats  = await getMockSkillStats();
      await saveMockSkills([newSkill, ...skills]);
      await saveMockSkillStats([...stats, newStat]);
      return { data: { ...newSkill, skill_stats: newStat }, error: null };
    }

    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .insert({ ...payload, user_id: userId })
      .select('*, skill_stats(*)')
      .single();

    if (skillError) return { data: null as unknown as SkillWithStats, error: skillError as Error };
    return { data: skillData as SkillWithStats, error: null };
  },

  deleteSkill: async (skillId: string): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay(300);
      const skills = await getMockSkills();
      const stats  = await getMockSkillStats();
      await saveMockSkills(skills.filter((s) => s.id !== skillId));
      await saveMockSkillStats(stats.filter((s) => s.skill_id !== skillId));
      return { data: undefined, error: null };
    }

    const { error } = await supabase.from('skills').delete().eq('id', skillId);
    if (error) return { data: undefined, error: error as Error };
    return { data: undefined, error: null };
  },

  updateSkillStat: async (
    skillId: string,
    updates: Partial<Tables<'skill_stats'>>,
  ): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      const stats = await getMockSkillStats();
      await saveMockSkillStats(
        stats.map((s) => (s.skill_id === skillId ? { ...s, ...updates } : s)),
      );
      return { data: undefined, error: null };
    }

    const { error } = await supabase
      .from('skill_stats')
      .update(updates)
      .eq('skill_id', skillId);
    if (error) return { data: undefined, error: error as Error };
    return { data: undefined, error: null };
  },
};
