import AsyncStorage from '@react-native-async-storage/async-storage';

import { IS_MOCK_MODE } from '@/constants/config';
import { supabase } from '@/lib/supabase/client';
import { MOCK_CREDENTIALS, MOCK_SESSION } from '@/mocks/data';
import { mockDelay } from '@/mocks/delay';
import type { AppSession, AuthProvider } from '@/types/auth';

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceResult<T> = Promise<{ data: T; error: Error | null }>;
type AuthStateListener = (session: AppSession | null) => void;

// ─── Mock internals ──────────────────────────────────────────────────────────
const MOCK_SESSION_KEY = 'mock_session';
const authStateListeners = new Set<AuthStateListener>();

function notifyAuthListeners(session: AppSession | null) {
  authStateListeners.forEach((l) => l(session));
}

function mapSupabaseSession(
  session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>,
): AppSession {
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? '',
      created_at: session.user.created_at,
    },
    access_token: session.access_token,
    expires_at: session.expires_at ?? 0,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function — always call it on cleanup.
   */
  onAuthStateChange: (listener: AuthStateListener): (() => void) => {
    if (IS_MOCK_MODE) {
      authStateListeners.add(listener);
      return () => authStateListeners.delete(listener);
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(session ? mapSupabaseSession(session) : null);
    });
    return () => subscription.unsubscribe();
  },

  getSession: async (): ServiceResult<{ session: AppSession | null }> => {
    if (IS_MOCK_MODE) {
      await mockDelay(200);
      try {
        const stored = await AsyncStorage.getItem(MOCK_SESSION_KEY);
        const session = stored ? (JSON.parse(stored) as AppSession) : null;
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    }
    const { data, error } = await supabase.auth.getSession();
    return {
      data: { session: data.session ? mapSupabaseSession(data.session) : null },
      error: error as Error | null,
    };
  },

  signInWithEmail: async (
    email: string,
    password: string,
  ): ServiceResult<{ session: AppSession | null }> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      if (
        email.toLowerCase() === MOCK_CREDENTIALS.email &&
        password === MOCK_CREDENTIALS.password
      ) {
        const session: AppSession = {
          ...MOCK_SESSION,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
        notifyAuthListeners(session);
        return { data: { session }, error: null };
      }
      return {
        data: { session: null },
        error: new Error('Invalid email or password.'),
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return {
      data: { session: data.session ? mapSupabaseSession(data.session) : null },
      error: error as Error | null,
    };
  },

  signUpWithEmail: async (
    email: string,
    password: string,
  ): ServiceResult<{ needsConfirmation: boolean }> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      // In mock mode, sign up always "succeeds" and requires email confirmation.
      return { data: { needsConfirmation: true }, error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return {
      data: { needsConfirmation: !data.session },
      error: error as Error | null,
    };
  },

  signOut: async (): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay(300);
      await AsyncStorage.removeItem(MOCK_SESSION_KEY);
      notifyAuthListeners(null);
      return { data: undefined, error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { data: undefined, error: error as Error | null };
  },

  resetPassword: async (email: string): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return { data: undefined, error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `expowrapper://reset-password`,
    });
    return { data: undefined, error: error as Error | null };
  },

  signInWithOAuth: async (_provider: AuthProvider): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      // Handled in the UI layer (shows an alert explaining mock mode)
      return { data: undefined, error: null };
    }
    // TODO: Integrate expo-auth-session for real OAuth flow.
    // See: https://supabase.com/docs/guides/auth/social-login/auth-google?platform=react-native
    return { data: undefined, error: new Error('OAuth not yet configured.') };
  },
};
