import { describe, it, expect } from 'vitest';

import {
  choiceOutcomesOf,
  displayLabel,
  gradedResult,
  interpretAttempt,
} from './interpret-attempt';
import type { ResolvedAttempt } from '@/features/cases/types/attempt-response.ts';

const resolved = (over: Partial<ResolvedAttempt> = {}): ResolvedAttempt => ({
  correct: true,
  correctLabel: 'malignant',
  teachingPoints: ['Irregular borders.', 'Colour variegation.'],
  disclaimer: 'Educational use only.',
  chosenLabel: 'malignant',
  timeToAnswerMs: 4200,
  ...over,
});

describe('interpretAttempt', () => {
  it('classifies a right answer as correct', () => {
    expect(
      interpretAttempt(resolved({ correct: true, chosenLabel: 'malignant' }))
        .outcome,
    ).toBe('correct');
  });

  it('classifies a wrong answer as incorrect', () => {
    expect(
      interpretAttempt(
        resolved({
          correct: false,
          chosenLabel: 'benign',
          correctLabel: 'malignant',
        }),
      ).outcome,
    ).toBe('incorrect');
  });

  it('classifies a skip as skipped regardless of the correct flag', () => {
    expect(
      interpretAttempt(resolved({ chosenLabel: 'skipped', correct: false }))
        .outcome,
    ).toBe('skipped');
  });

  it('normalizes labels to lower case (defensive against server casing)', () => {
    const verdict = interpretAttempt({
      ...resolved(),
      chosenLabel: 'MALIGNANT',
      correctLabel: 'Benign',
    } as unknown as ResolvedAttempt);
    expect(verdict.chosenLabel).toBe('malignant');
    expect(verdict.correctLabel).toBe('benign');
  });

  it('presents the diagnosis title-cased', () => {
    expect(
      interpretAttempt(resolved({ correctLabel: 'malignant' })).diagnosis,
    ).toBe('Malignant');
  });

  it('joins the server teaching points', () => {
    expect(
      interpretAttempt(resolved({ teachingPoints: ['One.', 'Two.'] })).teaching,
    ).toBe('One. Two.');
  });

  it('falls back to ABCDE guidance when there are no teaching points', () => {
    expect(
      interpretAttempt(resolved({ teachingPoints: [] })).teaching,
    ).toContain('ABCDE');
  });
});

describe('displayLabel', () => {
  it('presents the malignancy labels and skip', () => {
    expect(displayLabel('benign')).toBe('Benign');
    expect(displayLabel('malignant')).toBe('Malignant');
    expect(displayLabel('skipped')).toBe('Skip');
  });

  it('title-cases any other label defensively', () => {
    expect(displayLabel('other')).toBe('Other');
  });
});

describe('choiceOutcomesOf', () => {
  it('marks the chosen card correct and reveals nothing when right', () => {
    const verdict = interpretAttempt(
      resolved({
        correct: true,
        chosenLabel: 'malignant',
        correctLabel: 'malignant',
      }),
    );
    expect(choiceOutcomesOf(verdict)).toEqual({ malignant: 'correct' });
  });

  it('marks the chosen card incorrect and reveals the correct one when wrong', () => {
    const verdict = interpretAttempt(
      resolved({
        correct: false,
        chosenLabel: 'benign',
        correctLabel: 'malignant',
      }),
    );
    expect(choiceOutcomesOf(verdict)).toEqual({
      benign: 'incorrect',
      malignant: 'reveal-correct',
    });
  });

  it('returns undefined for a skip (nothing to highlight)', () => {
    const verdict = interpretAttempt(
      resolved({ chosenLabel: 'skipped', correct: false }),
    );
    expect(choiceOutcomesOf(verdict)).toBeUndefined();
  });
});

describe('gradedResult', () => {
  it('reports correctness and the correct label for a graded answer', () => {
    const right = interpretAttempt(
      resolved({
        correct: true,
        chosenLabel: 'malignant',
        correctLabel: 'malignant',
      }),
    );
    expect(gradedResult(right)).toEqual({
      isCorrect: true,
      correctLabel: 'malignant',
    });

    const wrong = interpretAttempt(
      resolved({
        correct: false,
        chosenLabel: 'benign',
        correctLabel: 'malignant',
      }),
    );
    expect(gradedResult(wrong)).toEqual({
      isCorrect: false,
      correctLabel: 'malignant',
    });
  });

  it('keeps the correct label on a skip but is not correct', () => {
    const verdict = interpretAttempt(
      resolved({
        chosenLabel: 'skipped',
        correct: false,
        correctLabel: 'benign',
      }),
    );
    expect(gradedResult(verdict)).toEqual({
      isCorrect: false,
      correctLabel: 'benign',
    });
  });
});
