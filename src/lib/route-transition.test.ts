import { describe, it, expect } from 'vitest';

import {
  classifyRouteTransition,
  shouldAnimateRouteTransition,
} from './route-transition';

describe('classifyRouteTransition', () => {
  it('returns none on initial load (no previous route)', () => {
    expect(classifyRouteTransition(undefined, '/app/dashboard')).toBe('none');
  });

  it('conjugates tab-to-tab hops laterally by tab order (Library < Progress < Profile)', () => {
    expect(classifyRouteTransition('/app/cases', '/app/dashboard')).toBe(
      'lateral-forward',
    );
    expect(classifyRouteTransition('/app/dashboard', '/app/profile')).toBe(
      'lateral-forward',
    );
    expect(classifyRouteTransition('/app/profile', '/app/cases')).toBe(
      'lateral-back',
    );
  });

  it('descends from a tab surface into any case-flow surface (Practice tab included)', () => {
    expect(classifyRouteTransition('/app/cases', '/app/cases/42/attempt')).toBe(
      'descend',
    );
    expect(
      classifyRouteTransition('/app/dashboard', '/app/cases/random/attempt'),
    ).toBe('descend');
    expect(classifyRouteTransition('/app/cases', '/app/cases/drill')).toBe(
      'descend',
    );
  });

  it('ascends from any case-flow surface back to a tab surface', () => {
    expect(classifyRouteTransition('/app/cases/42/attempt', '/app/cases')).toBe(
      'ascend',
    );
    expect(classifyRouteTransition('/app/cases/drill', '/app/dashboard')).toBe(
      'ascend',
    );
  });

  it('advances between case-flow surfaces (next case, drill chains)', () => {
    expect(
      classifyRouteTransition('/app/cases/42/attempt', '/app/cases/43/attempt'),
    ).toBe('advance');
    expect(
      classifyRouteTransition('/app/cases/drill', '/app/cases/9/attempt'),
    ).toBe('advance');
  });

  it('returns none for a re-render at the same path', () => {
    expect(classifyRouteTransition('/app/dashboard', '/app/dashboard')).toBe(
      'none',
    );
  });

  it('falls back to a neutral develop for unmapped surface pairs', () => {
    expect(classifyRouteTransition('/app/somewhere-new', '/app/profile')).toBe(
      'neutral',
    );
  });
});

describe('shouldAnimateRouteTransition', () => {
  it('never animates on initial mount (no previous path)', () => {
    expect(shouldAnimateRouteTransition(undefined, '/app/dashboard')).toBe(
      false,
    );
  });

  it('animates normal app-to-app navigation', () => {
    expect(shouldAnimateRouteTransition('/app/dashboard', '/app/profile')).toBe(
      true,
    );
  });

  it('animates an attempt → next-attempt hop (advance)', () => {
    expect(
      shouldAnimateRouteTransition(
        '/app/cases/42/attempt',
        '/app/cases/43/attempt',
      ),
    ).toBe(true);
  });

  it('does not animate a re-render at the same path', () => {
    expect(
      shouldAnimateRouteTransition('/app/dashboard', '/app/dashboard'),
    ).toBe(false);
  });
});
