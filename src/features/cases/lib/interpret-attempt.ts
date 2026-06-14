import type { ResolvedAttempt } from '@/features/cases/types/attempt-response.ts';

/** The graded meaning of an answered Attempt. */
export type Outcome = 'correct' | 'incorrect' | 'skipped';

/**
 * The resolved meaning of an answered Attempt — outcome, the normalized labels,
 * the presentation-cased diagnosis, and the teaching that explains it. The
 * semantic core both the review surface and the drill paint from; each surface
 * owns its own copy and card styling.
 */
export interface Verdict {
  outcome: Outcome;
  /** The learner's choice, normalized to lower case. */
  chosenLabel: string;
  /** The correct label, normalized to lower case. */
  correctLabel: string;
  /** The correct answer, presentation-cased — e.g. "Malignant". */
  diagnosis: string;
  /** The server's teaching points joined, or the ABCDE fallback when none. */
  teaching: string;
}

const ABCDE_FALLBACK =
  'Compare against the ABCDE markers — those are the features that drove the call.';

const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Interpret a resolved Attempt into its Verdict. A skip is skipped regardless of
 * the server's `correct` flag; otherwise that flag decides. Teaching always
 * resolves to something — the server's points, or the ABCDE fallback.
 */
export const interpretAttempt = (attempt: ResolvedAttempt): Verdict => {
  const chosenLabel = String(attempt.chosenLabel).toLowerCase();
  const correctLabel = String(attempt.correctLabel).toLowerCase();
  const outcome: Outcome =
    chosenLabel === 'skipped'
      ? 'skipped'
      : attempt.correct
        ? 'correct'
        : 'incorrect';
  const teaching =
    attempt.teachingPoints?.length > 0
      ? attempt.teachingPoints.join(' ')
      : ABCDE_FALLBACK;
  return {
    outcome,
    chosenLabel,
    correctLabel,
    diagnosis: titleCase(correctLabel),
    teaching,
  };
};
