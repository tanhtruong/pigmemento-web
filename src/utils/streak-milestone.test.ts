import { describe, it, expect } from 'vitest';

import {
  milestoneFor,
  shouldFireMilestoneCelebration,
} from './streak-milestone';

describe('milestoneFor', () => {
  it.each([
    [0, null],
    [1, null],
    [2, null],
    [3, 'week-1'],
    [4, 'week-1'],
    [6, 'week-1'],
    [7, 'first-week'],
    [10, 'first-week'],
    [14, 'two-weeks'],
    [29, 'two-weeks'],
    [30, 'one-month'],
    [60, 'one-month'],
    [365, 'one-month'],
  ])('streak %i → %s', (streak, expected) => {
    expect(milestoneFor(streak)).toBe(expected);
  });
});

describe('shouldFireMilestoneCelebration', () => {
  it('fires when crossing a threshold from below', () => {
    expect(shouldFireMilestoneCelebration(3, 2)).toBe(true);
    expect(shouldFireMilestoneCelebration(7, 6)).toBe(true);
    expect(shouldFireMilestoneCelebration(14, 13)).toBe(true);
    expect(shouldFireMilestoneCelebration(30, 29)).toBe(true);
  });

  it('does not fire when no threshold is crossed', () => {
    expect(shouldFireMilestoneCelebration(5, 4)).toBe(false);
    expect(shouldFireMilestoneCelebration(8, 7)).toBe(false);
  });

  it('does not fire when the threshold was already crossed', () => {
    expect(shouldFireMilestoneCelebration(5, 3)).toBe(false);
    expect(shouldFireMilestoneCelebration(10, 7)).toBe(false);
  });

  it('does not fire on backfill (previousSeen undefined) — never celebrates retroactively', () => {
    expect(shouldFireMilestoneCelebration(3, undefined)).toBe(false);
    expect(shouldFireMilestoneCelebration(30, undefined)).toBe(false);
  });
});
