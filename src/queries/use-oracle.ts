import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { oracleService } from '@/services/oracle.service';

import { useSession } from './use-session';

export function useQuestions() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.questions(session?.user.id ?? ''),
    queryFn: () => oracleService.getQuestions(session!.user.id),
    enabled: !!session,
    staleTime: 30_000,
  });
}

export function useSaveQuestion() {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ question, answer }: { question: string; answer: 'YES' | 'NO' }) =>
      oracleService.saveQuestion(session!.user.id, question, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions(session?.user.id ?? ''),
      });
    },
  });
}
