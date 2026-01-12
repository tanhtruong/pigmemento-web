import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { Label } from '@/features/cases/types/case-label.ts';

type AttemptRequest = {
  chosenLabel: Label; // user's guess
  timeToAnswerMs: number;
};

type AttemptResponse = {
  correct: boolean;
  correctLabel: Label;
  teachingPoints: string[];
  disclaimer: string;
};

export const useCaseSubmitAttempt = () => {
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
  });
};
