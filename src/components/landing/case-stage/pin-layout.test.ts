import { describe, it, expect } from 'vitest';

import { pinPositionFromCenter, pinReveal } from './pin-layout';

describe('pinPositionFromCenter', () => {
  it('maps the image centre to the plane origin (offset off the surface)', () => {
    const [x, y, z] = pinPositionFromCenter([0.5, 0.5]);
    expect(x).toBeCloseTo(0, 5);
    expect(y).toBeCloseTo(0, 5);
    expect(z).toBeGreaterThan(0); // floats toward the camera
  });

  it('flips image-y so the top of the image is +y on the plane', () => {
    const top = pinPositionFromCenter([0.5, 0]);
    const bottom = pinPositionFromCenter([0.5, 1]);
    expect(top[1]).toBeGreaterThan(0);
    expect(bottom[1]).toBeLessThan(0);
  });

  it('maps image-x left→right to plane -x→+x within the plane half-width', () => {
    expect(pinPositionFromCenter([0, 0.5])[0]).toBeCloseTo(-1.05, 5);
    expect(pinPositionFromCenter([1, 0.5])[0]).toBeCloseTo(1.05, 5);
  });
});

describe('pinReveal', () => {
  it('is 0 for every pin before the close-up beat starts', () => {
    for (let i = 0; i < 5; i++) expect(pinReveal(i, 5, 0.5)).toBe(0);
  });

  it('is 1 for every pin after the beat ends', () => {
    for (let i = 0; i < 5; i++) expect(pinReveal(i, 5, 0.8)).toBe(1);
  });

  it('reveals pins one at a time (earlier index leads)', () => {
    // A third of the way into the beat, the first pin leads the last.
    const p = 0.62;
    expect(pinReveal(0, 5, p)).toBeGreaterThan(pinReveal(4, 5, p));
  });

  it('rises monotonically with progress for a given pin', () => {
    expect(pinReveal(2, 5, 0.6)).toBeLessThanOrEqual(pinReveal(2, 5, 0.66));
    expect(pinReveal(2, 5, 0.66)).toBeLessThanOrEqual(pinReveal(2, 5, 0.72));
  });

  it('fully reveals the first pin within its own sub-window', () => {
    // span = (0.75 - 0.55) / 5 = 0.04 → pin 0 done by 0.59.
    expect(pinReveal(0, 5, 0.59)).toBeCloseTo(1, 5);
  });
});
