import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { userStatsService } from '@/services/user-stats.service';
import { useSession } from './use-session';

export function useUserStats() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.userStats(session?.user.id ?? ''),
    queryFn:  () => userStatsService.getUserStats(session!.user.id),
    enabled:  !!session?.user.id,
    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
  });
}
