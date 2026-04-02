import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { queryClient } from '@/lib/query/client';
import type { InsertTables } from '@/lib/supabase/types';
import { skillsService } from '@/services/skills.service';
import { useSession } from './use-session';

export function useSkills() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.skills(session?.user.id ?? ''),
    queryFn:  () => skillsService.getSkills(session!.user.id),
    enabled:  !!session?.user.id,
    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

export function useAddSkill() {
  const session = useSession();
  return useMutation({
    mutationFn: (payload: Omit<InsertTables<'skills'>, 'user_id'>) =>
      skillsService.addSkill(session!.user.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.skills(session!.user.id),
      });
    },
  });
}

export function useDeleteSkill() {
  const session = useSession();
  return useMutation({
    mutationFn: (skillId: string) => skillsService.deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.skills(session!.user.id),
      });
    },
  });
}
