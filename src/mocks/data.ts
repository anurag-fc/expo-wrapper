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
  bio: 'Mock profile — set EXPO_PUBLIC_USE_MOCK=false and connect Supabase to use real data.',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Tables<'notifications'>[] = [
  {
    id: 'notif-1',
    user_id: MOCK_USER.id,
    title: 'Welcome!',
    body: 'Your account is set up and ready to go.',
    data: null,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: MOCK_USER.id,
    title: 'Mock notification',
    body: 'This is a simulated push notification in mock mode.',
    data: { route: '/(app)/notifications' },
    read_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: MOCK_USER.id,
    title: 'Feature update',
    body: 'New features are ready in your app wrapper.',
    data: null,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
