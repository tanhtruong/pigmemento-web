import { Difficulty } from '@/features/cases/types/case-difficulty.ts';
import { AttemptSummary } from '@/features/cases/types/attempt-summary.ts';

export interface CaseListItem {
  id: string;
  imageUrl: string;
  difficulty: Difficulty;
  patientAge: number;
  site: string;
  lastAttempt?: AttemptSummary | null;
}
