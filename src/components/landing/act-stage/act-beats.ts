import type { CameraBeat } from '../case-stage/camera-beats';
import { lerp, smoothstep } from '@/lib/easing';

/**
 * Act I scroll choreography (#146), all driven by one 0–1 pinned-scroll progress:
 *
 *   arrive  0.00–0.18  wide, dim — the specimen sits under low light
 *   rake-in 0.18–0.55  camera pushes to ~20×, the dermatoscope light sweeps
 *                      across the surface, relief emerges
 *   reading 0.55–1.00  camera holds close; the graticule snaps to each ABCDE
 *                      feature in turn
 *
 * Act I stops at the end of the reading beat — the commitment hold + verdict are
 * the next slice (#147), which will re-apportion the tail of this range.
 */
export const ACT_CAMERA_BEATS: CameraBeat[] = [
  { at: 0.0, pos: [0, 0, 3.6] },
  { at: 0.18, pos: [0, 0, 3.6] },
  { at: 0.55, pos: [0, 0, 2.15] },
  { at: 1.0, pos: [0, 0, 2.15] },
];

export const READING_START = 0.55;
export const READING_END = 0.8;

/**
 * Where the take holds for the commitment (#147): the camera is already close
 * (it holds from 0.55 on), all ABCDE crosshairs are read in by READING_END, and
 * the scroll-hold + Benign/Malignant prompt take over the 0.8–1.0 tail.
 */
export const COMMIT_AT = 0.82;

/**
 * Raking-light control in the shader's uLight space (x: azimuth −1..1, y:
 * elevation −1..1). The light sweeps across the surface during the rake-in beat,
 * then eases up to a readable grazing angle for the reading beat. Pure +
 * renderer-free so the choreography is unit-testable without WebGL.
 */
export const rakeLightAt = (p: number): [number, number] => {
  const sweep = smoothstep(0.18, 0.55, p); // 0 before the push, 1 by close-up
  const settle = smoothstep(0.55, 0.82, p); // ease the light up for readability
  const azimuth = lerp(-0.85, 0.32, sweep);
  const elevation = lerp(-0.55, 0.08, Math.max(sweep, settle));
  return [azimuth, elevation];
};

/**
 * Overall light level (0–1). The specimen arrives dim and moody and lifts as the
 * dermatoscope light rakes in — the arrive beat is shadow, the push is the
 * reveal.
 */
export const exposureAt = (p: number): number =>
  lerp(0.4, 1.0, smoothstep(0.06, 0.5, p));
