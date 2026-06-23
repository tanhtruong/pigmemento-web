import { lerp } from '@/lib/easing';

export type CameraBeat = {
  /** Scroll progress (0–1) at which the camera reaches `pos`. */
  at: number;
  /** Camera position [x, y, z], looking at the lesion plane at the origin. */
  pos: [number, number, number];
};

/**
 * The scroll-driven dolly (#130), one scroll engine mapped to four framings:
 *   wide hero framing (0–18%, plane fills the frame — parity with the static
 *   layer) → push in on the lesion (18–55%) → hold close for the ABCDE beat
 *   (55–75%) → pull back and up toward the "your turn" CTA (75–100%).
 */
export const CAMERA_BEATS: CameraBeat[] = [
  { at: 0.0, pos: [0, 0, 3.8] },
  { at: 0.18, pos: [0, 0, 3.8] },
  { at: 0.55, pos: [0, 0, 2.2] },
  { at: 0.75, pos: [0, 0.05, 2.25] },
  { at: 1.0, pos: [0, 0.7, 4.4] },
];

/**
 * Camera position for scroll progress `p` (0–1), linearly interpolated across
 * the beats. Pure + renderer-free so the dolly mapping is unit-testable without
 * WebGL. Progress 0 (and reduced-motion / static, which never scrub) resolves
 * to the wide framing.
 */
export const cameraPositionAt = (
  p: number,
  beats: CameraBeat[] = CAMERA_BEATS,
): [number, number, number] => {
  const clamped = Math.max(0, Math.min(1, p));
  if (clamped <= beats[0].at) return beats[0].pos;

  const last = beats[beats.length - 1];
  if (clamped >= last.at) return last.pos;

  for (let i = 0; i < beats.length - 1; i++) {
    const from = beats[i];
    const to = beats[i + 1];
    if (clamped >= from.at && clamped <= to.at) {
      const t = (clamped - from.at) / (to.at - from.at);
      return [
        lerp(from.pos[0], to.pos[0], t),
        lerp(from.pos[1], to.pos[1], t),
        lerp(from.pos[2], to.pos[2], t),
      ];
    }
  }
  return last.pos;
};
