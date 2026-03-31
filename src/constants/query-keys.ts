// Centralized TanStack Query key factories.
// Using factory functions keeps cache invalidation precise and type-safe.
export const queryKeys = {
  session: ['session'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
} as const;
