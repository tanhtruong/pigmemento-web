import type { ResolvedAttempt } from '@/features/cases/types/attempt-response.ts';
import type {
  CaseChoice,
  CaseChoiceOutcome,
} from '@/components/cases/case-choice-card.tsx';

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

type MalignancyLabel = 'benign' | 'malignant';

const isMalignancyLabel = (label: string): label is MalignancyLabel =>
  label === 'benign' || label === 'malignant';

/**
 * Present a Case label for display — "Benign" / "Malignant" / "Skip". The one
 * place label casing lives; the review surface and the drill both paint from it.
 */
export const displayLabel = (label: string): string => {
  if (label === 'benign') return 'Benign';
  if (label === 'malignant') return 'Malignant';
  if (label === 'skipped') return 'Skip';
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : label;
};

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
    diagnosis: displayLabel(correctLabel),
    teaching,
  };
};

/**
 * The Verdict's reading of each Choice on the board: the chosen card shows its
 * grade (correct / incorrect); when the choice was wrong, the actually-correct
 * card is revealed. Returns `undefined` when there is nothing to highlight — a
 * skip, or a choice that isn't a malignancy call — so callers can gate on it.
 */
export const choiceOutcomesOf = (
  verdict: Verdict,
): Partial<Record<CaseChoice, CaseChoiceOutcome>> | undefined => {
  if (
    verdict.outcome === 'skipped' ||
    !isMalignancyLabel(verdict.chosenLabel)
  ) {
    return undefined;
  }
  const outcomes: Partial<Record<CaseChoice, CaseChoiceOutcome>> = {};
  outcomes[verdict.chosenLabel] =
    verdict.outcome === 'correct' ? 'correct' : 'incorrect';
  if (
    verdict.outcome === 'incorrect' &&
    isMalignancyLabel(verdict.correctLabel)
  ) {
    outcomes[verdict.correctLabel] = 'reveal-correct';
  }
  return outcomes;
};

/**
 * The Verdict-derived fields of a graded Drill result row — the running
 * correctness flag and the correct malignancy label (absent on a skip).
 */
export const gradedResult = (
  verdict: Verdict,
): { isCorrect: boolean; correctLabel?: MalignancyLabel } => ({
  isCorrect: verdict.outcome === 'correct',
  correctLabel: isMalignancyLabel(verdict.correctLabel)
    ? verdict.correctLabel
    : undefined,
});
