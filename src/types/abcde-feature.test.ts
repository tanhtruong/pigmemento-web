import { describe, it, expect } from 'vitest';

import { hasAbcdeFeatures } from './abcde-feature';

describe('hasAbcdeFeatures', () => {
  it('returns false when abcdeFeatures is undefined', () => {
    expect(hasAbcdeFeatures({})).toBe(false);
    expect(hasAbcdeFeatures({ abcdeFeatures: undefined })).toBe(false);
  });

  it('returns false when abcdeFeatures is empty', () => {
    expect(hasAbcdeFeatures({ abcdeFeatures: [] })).toBe(false);
  });

  it('returns true when abcdeFeatures has at least one entry', () => {
    expect(
      hasAbcdeFeatures({
        abcdeFeatures: [
          {
            letter: 'A',
            centerPoint: [0.3, 0.4],
            reasoning: 'Asymmetric across the long axis',
          },
        ],
      }),
    ).toBe(true);
  });
});
