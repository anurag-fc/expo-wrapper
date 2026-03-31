import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/query/client';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { AppSession } from '@/types/auth';

// Session lives in Zustand (managed by AuthProvider's listener), not TanStack Query.
// These hooks just read from the store and wrap mutations.

export function useSession(): AppSession | null {
  return useAuthStore((s) => s.session);
}

export function useIsAuthReady(): boolean {
  return useAuthStore((s) => s.isReady);
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signInWithEmail(email, password),
    onError: () => {
      // Error is surfaced via the mutation's `error` field — no global handling needed here.
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signUpWithEmail(email, password),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      // Clear all cached data on sign-out to prevent leakage between accounts.
      queryClient.clear();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
  });
}
