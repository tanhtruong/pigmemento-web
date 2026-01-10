import { Label } from '@/features/cases/types/case-label.ts';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';

export interface AttemptResponse {
  correct: boolean;
  correctLabel: Label;
  teachingPoints: string[];
  disclaimer: string;
}

export const useCaseLatestAttempt = (caseId?: string) => {
  return useQuery<
    AttemptResponse & { chosenLabel: Label; timeToAnswerMs: number }
  >({
    queryKey: queryKeys['latest-attempt'](caseId!),
    queryFn: async () => {
      const res = await api.get<
        AttemptResponse & { chosenLabel: Label; timeToAnswerMs: number }
      >(`/cases/${caseId}/attempts/latest`);
      return res.data;
    },
    enabled: !!caseId,
  });
};
