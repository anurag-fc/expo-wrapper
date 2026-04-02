// Centralized TanStack Query key factories.
// Using factory functions keeps cache invalidation precise and type-safe.
export const queryKeys = {
  session:       ['session'] as const,
  profile:       (userId: string) => ['profile',        userId] as const,
  notifications: (userId: string) => ['notifications',  userId] as const,
  skills:        (userId: string) => ['skills',         userId] as const,
  skillStats:    (skillId: string) => ['skill-stats',   skillId] as const,
  progress:      (userId: string, from: string, to: string) =>
                   ['progress', userId, from, to] as const,
  userStats:     (userId: string) => ['user-stats',     userId] as const,
} as const;
