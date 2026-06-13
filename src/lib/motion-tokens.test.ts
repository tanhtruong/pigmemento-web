import { describe, it, expect } from 'vitest';

import {
  motionTokens,
  SHAKE_KEYFRAMES_X,
  developVariants,
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

/** Resolve a develop state (object or custom-function) into its target. */
const resolveState = (
  key: 'latent' | 'developed' | 'fixed' | 'held',
  variant: RouteTransitionVariant,
): Record<string, unknown> => {
  const state = developVariants[key];
  return (typeof state === 'function' ? state(variant) : state) as Record<
    string,
    unknown
  >;
};

const axis = (target: Record<string, unknown>) =>
  Math.max(Math.abs(Number(target.x ?? 0)), Math.abs(Number(target.y ?? 0)));

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

describe('developVariants — the seamless in-app handoff (#65)', () => {
  it('enters with a directional drift that stays subtle (≤ 8px)', () => {
    for (const variant of DIRECTIONAL) {
      const latent = resolveState('latent', variant);
      expect(axis(latent)).toBeGreaterThan(0); // still signals direction
      expect(axis(latent)).toBeLessThanOrEqual(8); // but only a whisper
    }
  });

  it('exits by dimming, without drifting — only opacity carries the exit', () => {
    for (const variant of DIRECTIONAL) {
      const fixed = resolveState('fixed', variant);
      expect(axis(fixed)).toBe(0); // no slide on the way out
      expect(Number(fixed.opacity)).toBeLessThan(1); // it fades…
    }
  });

  it('never reaches a blank frame — the dissolve keeps both ends above zero', () => {
    for (const variant of DIRECTIONAL) {
      const latent = resolveState('latent', variant);
      const fixed = resolveState('fixed', variant);
      // Arriving surface starts at the floor, leaving surface fades to it —
      // at the swap neither is blank, so the screen never blinks (#65).
      expect(Number(latent.opacity)).toBeGreaterThan(0);
      expect(Number(latent.opacity)).toBeLessThan(1);
      expect(Number(fixed.opacity)).toBeGreaterThan(0);
      expect(Number(latent.opacity)).toBe(Number(fixed.opacity)); // meet at the floor
    }
    // The fully-arrived surface is at full strength.
    expect(resolveState('developed', 'descend').opacity).toBe(1);
  });

  it('carries no colour-matrix wash on any develop state (the "bloom" is gone)', () => {
    for (const variant of DIRECTIONAL) {
      expect(resolveState('latent', variant).filter).toBeUndefined();
      expect(resolveState('developed', variant).filter).toBeUndefined();
      expect(resolveState('fixed', variant).filter).toBeUndefined();
    }
    expect(resolveState('held', 'descend').filter).toBeUndefined();
  });
});
