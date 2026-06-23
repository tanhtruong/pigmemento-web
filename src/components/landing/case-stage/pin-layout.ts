import { smoothstep } from '@/lib/easing';

// The lesion plane is 2.1 × 2.6, centred at the origin in the xy-plane (see the
// Specimen in r3f-scene). Pins float `PIN_Z` off its surface toward the camera
// so they parallax against the plane as the stage tilts and the camera dollies.
const PLANE_W = 2.1;
const PLANE_H = 2.6;
const PIN_Z = 0.18;

/**
 * Maps a normalized ABCDE `centerPoint` (image coords: x 0→1 left→right, y 0→1
 * top→bottom) onto a 3D pin position on the plane. Y is flipped so image-top
 * maps to plane-top (+y). Pure + renderer-free so the layout is unit-testable.
 */
export const pinPositionFromCenter = (
  centerPoint: [number, number],
  planeW = PLANE_W,
  planeH = PLANE_H,
  z = PIN_Z,
): [number, number, number] => {
  const [cx, cy] = centerPoint;
  return [(cx - 0.5) * planeW, (0.5 - cy) * planeH, z];
};

/**
 * Staggered reveal factor (0→1) for pin `index` of `count`, as scroll progress
 * crosses the close-up ABCDE beat [start, end] (#130's 55–75%). Each pin gets an
 * even sub-window, so the five pins appear one at a time.
 */
export const pinReveal = (
  index: number,
  count: number,
  progress: number,
  start = 0.55,
  end = 0.75,
): number => {
  const span = (end - start) / count;
  const from = start + index * span;
  return smoothstep(from, from + span, progress);
};
