import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { Label } from '@/types/case-label.ts';
import { AttemptResponse } from '@/features/cases/types/attempt-response.ts';

type AttemptRequest = {
  chosenLabel: Label; // user's guess
  timeToAnswerMs: number;
};

export const useCaseSubmitAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      attempt,
    }: {
      caseId: string;
      attempt: AttemptRequest;
    }) => {
      const res = await api.post<AttemptResponse>(
        `/cases/${caseId}/answer`,
        attempt,
      );
      return res.data as AttemptResponse;
    },
    // Seed the latest-attempt cache from the answer the server just gave us, plus
    // the choice we already hold. The review surface routed to right after this
    // then renders the verdict immediately instead of flashing its loading
    // spinner while it refetches — the seam that made the Case→Review hop flicker
    // (#82).
    onSuccess: (data, { caseId, attempt }) => {
      queryClient.setQueryData(queryKeys['latest-attempt'](caseId), {
        ...data,
        chosenLabel: attempt.chosenLabel,
        timeToAnswerMs: attempt.timeToAnswerMs,
      });
    },
  });
};
