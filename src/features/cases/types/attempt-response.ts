import { Label } from '@/features/cases/types/case-label.ts';

/**
 * The server's grading of an Attempt — returned by `POST /cases/:id/answer`,
 * and (as the base of {@link ResolvedAttempt}) by
 * `GET /cases/:id/attempts/latest`. The single definition both endpoints share.
 */
export interface AttemptResponse {
  correct: boolean;
  correctLabel: Label;
  teachingPoints: string[];
  disclaimer: string;
}

/**
 * A resolved Attempt: the server grading plus the learner's own choice and
 * answer time. The shape the latest-attempt query returns and the submit
 * mutation seeds.
 */
export interface ResolvedAttempt extends AttemptResponse {
  chosenLabel: Label;
  timeToAnswerMs: number;
}
