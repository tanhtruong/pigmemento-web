/**
 * Shared scrub-math primitives for the landing beats. The stage choreography
 * maps scroll progress (0–1) onto camera, light, and travel values; these are
 * the pure building blocks it interpolates with. Kept renderer-free so every
 * `*-beats` module stays unit-testable without WebGL.
 */

/** Clamp `x` into the 0–1 range. */
export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/** Linearly interpolate from `a` to `b` by `t` (unclamped). */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/**
 * Hermite smoothstep: 0 at/below `edge0`, 1 at/above `edge1`, with an
 * ease-in-out (3t² − 2t³) across the [edge0, edge1] window. Clamped at both ends.
 */
export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
