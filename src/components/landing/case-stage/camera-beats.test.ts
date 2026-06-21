import { describe, it, expect } from 'vitest';

import { CAMERA_BEATS, cameraPositionAt } from './camera-beats';

const z = (p: number) => cameraPositionAt(p)[2];

describe('cameraPositionAt', () => {
  it('holds the wide framing across the hero beat (0–18%)', () => {
    const wide = CAMERA_BEATS[0].pos;
    expect(cameraPositionAt(0)).toEqual(wide);
    expect(cameraPositionAt(0.18)).toEqual(wide);
  });

  it('clamps out-of-range progress to the end framings', () => {
    expect(cameraPositionAt(-1)).toEqual(CAMERA_BEATS[0].pos);
    expect(cameraPositionAt(2)).toEqual(
      CAMERA_BEATS[CAMERA_BEATS.length - 1].pos,
    );
  });

  it('pushes in (z decreases) from the hero beat to the close beat', () => {
    expect(z(0.55)).toBeLessThan(z(0.18));
    // Monotonic dolly-in across the push beat.
    expect(z(0.4)).toBeLessThan(z(0.18));
    expect(z(0.4)).toBeGreaterThan(z(0.55));
  });

  it('holds close through the ABCDE beat (55–75%)', () => {
    expect(z(0.55)).toBeCloseTo(2.2, 1);
    expect(z(0.75)).toBeCloseTo(2.25, 1);
  });

  it('pulls back and up toward the CTA (75–100%)', () => {
    const end = cameraPositionAt(1);
    // Further back than the close beat...
    expect(end[2]).toBeGreaterThan(z(0.75));
    // ...and raised.
    expect(end[1]).toBeGreaterThan(cameraPositionAt(0.75)[1]);
  });

  it('interpolates linearly at a segment midpoint', () => {
    // Midway through the push beat (0.18 → 0.55): z halfway between 3.8 and 2.2.
    const mid = cameraPositionAt((0.18 + 0.55) / 2)[2];
    expect(mid).toBeCloseTo((3.8 + 2.2) / 2, 5);
  });
});
