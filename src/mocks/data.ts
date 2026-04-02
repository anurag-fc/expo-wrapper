import type { AppSession, AppUser } from '@/types/auth';
import type { Tables } from '@/lib/supabase/types';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const MOCK_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123',
};

export const MOCK_USER: AppUser = {
  id: 'mock-user-id-123',
  email: MOCK_CREDENTIALS.email,
  created_at: '2024-01-01T00:00:00.000Z',
};

export const MOCK_SESSION: AppSession = {
  user: MOCK_USER,
  access_token: 'mock-access-token-xyz',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const MOCK_PROFILE: Tables<'profiles'> = {
  id: MOCK_USER.id,
  email: MOCK_USER.email,
  full_name: 'Demo User',
  avatar_url: null,
  bio: 'Self-learner on a mission.',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Tables<'notifications'>[] = [
  {
    id: 'notif-1',
    user_id: MOCK_USER.id,
    title: '🔥 4-day streak!',
    body: 'You\'re on a roll — keep logging to extend your streak.',
    data: null,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: MOCK_USER.id,
    title: '⭐ 90 XP earned today',
    body: 'You logged 3 lessons across 2 skills.',
    data: null,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: MOCK_USER.id,
    title: '✅ Skill completed!',
    body: 'You finished Digital Photography. Rate it to earn 5 XP.',
    data: { route: '/(app)/' },
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: MOCK_USER.id,
    title: "📅 Don't break your streak",
    body: "You haven't logged anything yet today.",
    data: null,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// ─── Skills ───────────────────────────────────────────────────────────────────
export const MOCK_SKILLS: Tables<'skills'>[] = [
  {
    id: 'mock-skill-code-001',
    user_id: MOCK_USER.id,
    name: 'React Native Mastery',
    category: 'code',
    source: 'Udemy',
    total_lessons: 15,
    goal_date: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'mock-skill-design-001',
    user_id: MOCK_USER.id,
    name: 'UI/UX Design Fundamentals',
    category: 'design',
    source: 'Figma Academy',
    total_lessons: 10,
    goal_date: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: 'mock-skill-business-001',
    user_id: MOCK_USER.id,
    name: 'Product Strategy',
    category: 'business',
    source: 'Book: Inspired',
    total_lessons: 8,
    goal_date: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'mock-skill-creative-001',
    user_id: MOCK_USER.id,
    name: 'Digital Photography',
    category: 'creative',
    source: 'YouTube',
    total_lessons: 6,
    goal_date: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

// ─── Skill stats ──────────────────────────────────────────────────────────────
export const MOCK_SKILL_STATS: Tables<'skill_stats'>[] = [
  {
    skill_id: 'mock-skill-code-001',
    completed_lessons: 9,
    is_completed: false,
    completed_at: null,
    star_rating: null,
  },
  {
    skill_id: 'mock-skill-design-001',
    completed_lessons: 6,
    is_completed: false,
    completed_at: null,
    star_rating: null,
  },
  {
    skill_id: 'mock-skill-business-001',
    completed_lessons: 3,
    is_completed: false,
    completed_at: null,
    star_rating: null,
  },
  {
    skill_id: 'mock-skill-creative-001',
    completed_lessons: 6,
    is_completed: true,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    star_rating: 4,
  },
];

// ─── Progress logs (last 7 days for calendar strip) ───────────────────────────
const DAY = 24 * 60 * 60 * 1000;

export const MOCK_PROGRESS_LOGS: Tables<'progress_logs'>[] = [
  // Today
  { id: 'log-1', user_id: MOCK_USER.id, skill_id: 'mock-skill-code-001',    lessons_done: 2, logged_at: new Date(Date.now() - 1000 * 30).toISOString() },
  { id: 'log-2', user_id: MOCK_USER.id, skill_id: 'mock-skill-design-001',  lessons_done: 1, logged_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  // Yesterday
  { id: 'log-3', user_id: MOCK_USER.id, skill_id: 'mock-skill-code-001',    lessons_done: 1, logged_at: new Date(Date.now() - DAY - 1000 * 60 * 120).toISOString() },
  // 2 days ago
  { id: 'log-4', user_id: MOCK_USER.id, skill_id: 'mock-skill-design-001',  lessons_done: 2, logged_at: new Date(Date.now() - 2 * DAY - 1000 * 60 * 90).toISOString() },
  // 3 days ago
  { id: 'log-5', user_id: MOCK_USER.id, skill_id: 'mock-skill-business-001',lessons_done: 1, logged_at: new Date(Date.now() - 3 * DAY - 1000 * 60 * 60).toISOString() },
  // 4 days ago — intentional gap (streak break)
  // 5 days ago
  { id: 'log-6', user_id: MOCK_USER.id, skill_id: 'mock-skill-creative-001',lessons_done: 3, logged_at: new Date(Date.now() - 5 * DAY - 1000 * 60 * 45).toISOString() },
  // 6 days ago
  { id: 'log-7', user_id: MOCK_USER.id, skill_id: 'mock-skill-design-001',  lessons_done: 1, logged_at: new Date(Date.now() - 6 * DAY - 1000 * 60 * 180).toISOString() },
];

// ─── User stats ───────────────────────────────────────────────────────────────
export const MOCK_USER_STATS: Tables<'user_stats'> = {
  user_id: MOCK_USER.id,
  xp: 890,
  level: 2,
  current_streak: 4,
  longest_streak: 7,
  last_logged_at: new Date(Date.now() - 1000 * 30).toISOString(),
  timezone: 'UTC',
};
