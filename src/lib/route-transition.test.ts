import { describe, it, expect } from 'vitest';

import { shouldAnimateRouteTransition } from './route-transition';

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

  it('skips animation on the case-attempt to case-review centerpiece hop', () => {
    expect(
      shouldAnimateRouteTransition(
        '/app/cases/42/attempt',
        '/app/cases/42/review',
      ),
    ).toBe(false);
  });

  it('skips animation on any attempt to any review (loose rule)', () => {
    expect(
      shouldAnimateRouteTransition(
        '/app/cases/99/attempt',
        '/app/cases/123/review',
      ),
    ).toBe(false);
  });

  it('still animates from case-review back to case-attempt (one-way exclusion)', () => {
    expect(
      shouldAnimateRouteTransition(
        '/app/cases/42/review',
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
