import { describe, it, expect } from 'vitest';

import {
  LIBRARY_BEATS,
  activeBeat,
  beatReveal,
  travelAt,
} from './library-beats';

const SPACING = 3.2;
const AT = [0.12, 0.38, 0.62, 0.86];

describe('library-beats choreography', () => {
  it('centres each hero specimen under the lens at its dwell', () => {
    AT.forEach((at, k) => {
      expect(travelAt(at)).toBeCloseTo(LIBRARY_BEATS[k].specimen * SPACING, 5);
    });
  });

  it('holds the hero centred across the whole dwell plateau', () => {
    const target = LIBRARY_BEATS[1].specimen * SPACING;
    expect(travelAt(AT[1] - 0.06)).toBeCloseTo(target, 5);
    expect(travelAt(AT[1] + 0.06)).toBeCloseTo(target, 5);
  });

  it('only ever moves the stage forward (monotonic travel)', () => {
    let prev = -Infinity;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const t = travelAt(p);
      expect(t).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = t;
    }
  });

  it('reports the active beat only inside a dwell, -1 between', () => {
    AT.forEach((at, k) => expect(activeBeat(at)).toBe(k));
    expect(activeBeat((AT[0] + AT[1]) / 2)).toBe(-1);
  });

  it('reveals a beat fully at its centre and not far away', () => {
    expect(beatReveal(2, AT[2])).toBeCloseTo(1, 5);
    expect(beatReveal(2, AT[2] + 0.2)).toBeCloseTo(0, 5);
  });

  it('races past the last hero to the end of the strip (Format speed)', () => {
    expect(travelAt(1)).toBeCloseTo(23 * SPACING, 5);
    expect(travelAt(1)).toBeGreaterThan(LIBRARY_BEATS[3].specimen * SPACING);
  });
});
