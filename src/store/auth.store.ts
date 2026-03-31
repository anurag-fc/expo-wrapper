import { create } from 'zustand';

import type { AppSession } from '@/types/auth';

interface AuthState {
  // The current session. null = signed out, undefined = not yet determined.
  session: AppSession | null;
  // true once the initial session check has completed (prevents auth-guard flash).
  isReady: boolean;
  setSession: (session: AppSession | null) => void;
  setReady: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isReady: false,
  setSession: (session) => set({ session }),
  setReady: () => set({ isReady: true }),
}));
