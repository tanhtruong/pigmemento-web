import { describe, it, expect } from 'vitest';

import {
  motionTokens,
  SHAKE_KEYFRAMES_X,
  developVariants,
  VERDICT_ENTER_OPACITY,
} from './motion-tokens';
import type { RouteTransitionVariant } from './route-transition';

/** Directional develop grammars — the hops that carry a spatial drift. */
const DIRECTIONAL: RouteTransitionVariant[] = [
  'lateral-forward',
  'lateral-back',
  'descend',
  'ascend',
  'advance',
];

const resolveState = (
  key: 'latent' | 'developed' | 'fixed' | 'held',
  variant: RouteTransitionVariant,
): Record<string, unknown> => {
  const state = developVariants[key];
  // motion's Variant resolver type declares (custom, current, velocity); we
  // only pass custom, so narrow to a single-arg callable before invoking.
  if (typeof state === 'function') {
    return (
      state as (custom: RouteTransitionVariant) => Record<string, unknown>
    )(variant);
  }
  return state as Record<string, unknown>;
};

const axis = (target: Record<string, unknown>) =>
  Math.max(Math.abs(Number(target.x ?? 0)), Math.abs(Number(target.y ?? 0)));

describe('developVariants — the quiet dissolve handoff (#73)', () => {
  it('enters with a directional drift that stays subtle (≤ 8px)', () => {
    for (const variant of DIRECTIONAL) {
      const latent = resolveState('latent', variant);
      expect(axis(latent)).toBeGreaterThan(0); // still signals direction
      expect(axis(latent)).toBeLessThanOrEqual(8); // but only a whisper
    }
  });

  it('exits by fading, without drifting — only opacity carries the exit', () => {
    for (const variant of DIRECTIONAL) {
      const fixed = resolveState('fixed', variant);
      expect(axis(fixed)).toBe(0);
      expect(Number(fixed.opacity)).toBe(0);
    }
  });

  it('never blanks the screen on entry — the incoming surface starts above zero', () => {
    for (const variant of DIRECTIONAL) {
      const latent = resolveState('latent', variant);
      expect(Number(latent.opacity)).toBeGreaterThan(0);
      expect(Number(latent.opacity)).toBeLessThan(1);
    }
    expect(resolveState('developed', 'descend').opacity).toBe(1);
  });

  it('carries no colour-matrix wash on any develop state', () => {
    for (const variant of DIRECTIONAL) {
      expect(resolveState('latent', variant).filter).toBeUndefined();
      expect(resolveState('developed', variant).filter).toBeUndefined();
      expect(resolveState('fixed', variant).filter).toBeUndefined();
    }
  });
});

describe('verdict entry floor (#98)', () => {
  it('enters from a floor — present, never a blank gap, and below full', () => {
    expect(VERDICT_ENTER_OPACITY).toBeGreaterThan(0);
    expect(VERDICT_ENTER_OPACITY).toBeLessThan(1);
  });
});

describe('shake token', () => {
  it('is brief — a jolt, not an oscillation', () => {
    expect(motionTokens.shake.duration).toBeLessThanOrEqual(0.2);
  });

  it('starts and ends at rest so the panel never drifts', () => {
    expect(SHAKE_KEYFRAMES_X[0]).toBe(0);
    expect(SHAKE_KEYFRAMES_X[SHAKE_KEYFRAMES_X.length - 1]).toBe(0);
  });

  it('stays subtle — max amplitude 6px, editorial not cartoonish', () => {
    expect(Math.max(...SHAKE_KEYFRAMES_X.map(Math.abs))).toBeLessThanOrEqual(6);
  });
});
