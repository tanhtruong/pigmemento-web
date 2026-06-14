import { describe, it, expect } from 'vitest';

import { planInAppTransition } from './plan-in-app-transition';

describe('planInAppTransition', () => {
  it('runs a View Transition for a supported in-app hop, carrying the classified variant', () => {
    const plan = planInAppTransition({
      from: '/app/cases',
      to: '/app/dashboard',
      reducedMotion: false,
      supportsVT: true,
    });

    expect(plan).toEqual({
      mode: 'view-transition',
      variant: 'lateral-forward',
      restoreScroll: false,
    });
  });

  it('is a no-op instant cut when the surface does not change (none variant)', () => {
    const plan = planInAppTransition({
      from: '/app/dashboard',
      to: '/app/dashboard',
      reducedMotion: false,
      supportsVT: true,
    });

    expect(plan).toEqual({
      mode: 'instant',
      variant: 'none',
      restoreScroll: false,
    });
  });

  it('cuts instantly when the browser lacks startViewTransition', () => {
    const plan = planInAppTransition({
      from: '/app/dashboard',
      to: '/app/profile',
      reducedMotion: false,
      supportsVT: false,
    });

    expect(plan).toEqual({
      mode: 'instant',
      variant: 'lateral-forward',
      restoreScroll: false,
    });
  });

  it('cuts instantly under reduced motion, but still resolves the variant and scroll decision', () => {
    const plan = planInAppTransition({
      from: '/app/cases/42/attempt',
      to: '/app/cases',
      reducedMotion: true,
      supportsVT: true,
    });

    expect(plan).toEqual({
      mode: 'instant',
      variant: 'ascend',
      restoreScroll: true,
    });
  });

  it('restores scroll only when coming back — ascend and lateral-back, not forward or descend', () => {
    const restoring = (from: string, to: string) =>
      planInAppTransition({ from, to, reducedMotion: false, supportsVT: true })
        .restoreScroll;

    expect(restoring('/app/cases/42/attempt', '/app/cases')).toBe(true);
    expect(restoring('/app/profile', '/app/cases')).toBe(true);
    expect(restoring('/app/cases', '/app/dashboard')).toBe(false);
    expect(restoring('/app/cases', '/app/cases/42/attempt')).toBe(false);
  });

  it('stays inert on initial load when there is no previous surface', () => {
    const plan = planInAppTransition({
      from: undefined,
      to: '/app/dashboard',
      reducedMotion: false,
      supportsVT: true,
    });

    expect(plan).toEqual({
      mode: 'instant',
      variant: 'none',
      restoreScroll: false,
    });
  });
});
