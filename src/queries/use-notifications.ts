import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { queryClient } from '@/lib/query/client';
import { notificationsService } from '@/services/notifications.service';
import { useSession } from './use-session';

export function useNotifications() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.notifications(session?.user.id ?? ''),
    queryFn: () => notificationsService.getNotifications(session!.user.id),
    enabled: !!session?.user.id,
    select: (result) => result.data,
  });
}

export function useMarkAsRead() {
  const session = useSession();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(session?.user.id ?? ''),
      });
    },
  });
}
