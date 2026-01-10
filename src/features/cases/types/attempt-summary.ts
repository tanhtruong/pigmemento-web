import { Label } from '@/features/cases/types/case-label.ts';

export type AttemptSummary = {
  correct: boolean;
  chosenLabel: Label;
  createdAt: string;
  totalAttempts: number;
  timeToAnswerMs: number;
};
