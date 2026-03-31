import React, { useEffect } from 'react';

import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

/**
 * Bootstraps auth state on app launch and keeps the Zustand auth store in sync.
 *
 * In mock mode: reads the stored mock session from AsyncStorage and subscribes
 * to the mock auth emitter (fires on signIn / signOut).
 *
 * In real mode: subscribes to supabase.auth.onAuthStateChange.
 *
 * Either way, the rest of the app just reads from `useAuthStore`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setReady = useAuthStore((s) => s.setReady);

  useEffect(() => {
    // 1. Load the initial session (async — clears the "not yet determined" state).
    authService.getSession().then(({ data }) => {
      setSession(data.session);
      setReady();
    });

    // 2. Subscribe to future auth state changes.
    const unsubscribe = authService.onAuthStateChange((session) => {
      setSession(session);
      // Mark ready in case the listener fires before getSession resolves.
      setReady();
    });

    return unsubscribe;
  }, [setSession, setReady]);

  return <>{children}</>;
}
