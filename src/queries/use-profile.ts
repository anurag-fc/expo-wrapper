import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { queryClient } from '@/lib/query/client';
import type { Tables, UpdateTables } from '@/lib/supabase/types';
import { userService } from '@/services/user.service';
import { useSession } from './use-session';

export function useProfile() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.profile(session?.user.id ?? ''),
    queryFn: () => userService.getProfile(session!.user.id),
    // Only fetch when we have a logged-in user.
    enabled: !!session?.user.id,
    select: (result) => result.data,
  });
}

export function useUpdateProfile() {
  const session = useSession();

  return useMutation({
    mutationFn: (updates: UpdateTables<'profiles'>) =>
      userService.updateProfile(session!.user.id, updates),

    // Optimistic update — the UI reflects the change before the server confirms.
    onMutate: async (updates) => {
      const key = queryKeys.profile(session!.user.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: { data: Tables<'profiles'> } | undefined) => ({
        data: old?.data ? { ...old.data, ...updates } : old?.data,
        error: null,
      }));
      return { previous };
    },

    onError: (_err, _updates, context) => {
      // Roll back the optimistic update on error.
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.profile(session!.user.id), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(session!.user.id) });
    },
  });
}
