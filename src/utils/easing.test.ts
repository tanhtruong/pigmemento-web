import { describe, it, expect } from 'vitest';

import { clamp01, lerp, smoothstep } from './easing';

describe('clamp01', () => {
  it('passes through values already in range', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });

  it('clamps below 0 and above 1', () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(42)).toBe(1);
  });
});

describe('lerp', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(lerp(2, 10, 0)).toBe(2);
    expect(lerp(2, 10, 1)).toBe(10);
  });

  it('interpolates the midpoint', () => {
    expect(lerp(2, 10, 0.5)).toBe(6);
  });

  it('does not clamp (extrapolates past the endpoints)', () => {
    expect(lerp(0, 10, 2)).toBe(20);
    expect(lerp(0, 10, -1)).toBe(-10);
  });
});

describe('smoothstep', () => {
  it('is 0 at/below edge0 and 1 at/above edge1', () => {
    expect(smoothstep(0.2, 0.6, 0.1)).toBe(0);
    expect(smoothstep(0.2, 0.6, 0.2)).toBe(0);
    expect(smoothstep(0.2, 0.6, 0.6)).toBe(1);
    expect(smoothstep(0.2, 0.6, 0.9)).toBe(1);
  });

  it('is 0.5 at the midpoint of the window', () => {
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 10);
  });

  it('eases in and out (flatter near the edges than the middle)', () => {
    const lower = smoothstep(0, 1, 0.1);
    const upper = smoothstep(0, 1, 0.9);
    // Ends are pulled toward 0/1 vs a linear ramp.
    expect(lower).toBeLessThan(0.1);
    expect(upper).toBeGreaterThan(0.9);
    // Symmetric about the midpoint.
    expect(lower).toBeCloseTo(1 - upper, 10);
  });
});
