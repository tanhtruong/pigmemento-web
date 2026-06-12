import { describe, it, expect } from 'vitest';

import { motionTokens, SHAKE_KEYFRAMES_X } from './motion-tokens';

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
