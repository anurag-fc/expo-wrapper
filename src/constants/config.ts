// ─── Mock Mode ──────────────────────────────────────────────────────────────
// When true, all API calls return dummy data. No real Supabase connection needed.
// Toggle via EXPO_PUBLIC_USE_MOCK=true in your .env file.
// Mock credentials: demo@example.com / demo123
export const IS_MOCK_MODE = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// ─── Supabase ────────────────────────────────────────────────────────────────
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
  | 'development'
  | 'production';
export const IS_DEV = APP_ENV === 'development';
export const APP_SCHEME = 'expowrapper';
