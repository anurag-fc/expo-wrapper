import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { queryClient } from '@/lib/query/client';
import { progressService } from '@/services/progress.service';
import { useSession } from './use-session';

/** Returns progress logs for a 7-day window ending today. */
export function useWeeklyProgress() {
  const session = useSession();

  const to   = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);

  const fromStr = from.toISOString();
  const toStr   = to.toISOString();

  return useQuery({
    queryKey: queryKeys.progress(session?.user.id ?? '', fromStr, toStr),
    queryFn:  () => progressService.getProgressLogs(session!.user.id, fromStr, toStr),
    enabled:  !!session?.user.id,
    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

export function useLogProgress() {
  const session = useSession();

  return useMutation({
    mutationFn: ({
      skillId,
      lessonsDone,
      timezone = 'UTC',
    }: {
      skillId: string;
      lessonsDone: number;
      timezone?: string;
    }) => progressService.logProgress(session!.user.id, skillId, lessonsDone, timezone),

    onSuccess: () => {
      const uid = session!.user.id;
      // Invalidate everything that depends on progress
      queryClient.invalidateQueries({ queryKey: queryKeys.skills(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats(uid) });
      // Invalidate all progress windows (wildcard by prefix)
      queryClient.invalidateQueries({ queryKey: ['progress', uid] });
    },
  });
}
