import { QueryClient } from '@tanstack/react-query';

// Singleton — do NOT create this inside a component.
// Services can import it directly for imperative cache operations (e.g. on sign-out).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      retry: 0,
    },
  },
});
