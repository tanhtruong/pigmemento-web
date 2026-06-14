import { describe, it, expect } from 'vitest';

import { interpretAttempt } from './interpret-attempt';
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
