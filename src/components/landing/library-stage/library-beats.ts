/**
 * Lock-in choreography for the specimen-library set-piece (#163, PRD §5/§8). The
 * horizontal stage no longer travels linearly: as scroll progress runs 0→1 it
 * eases and HOLDS at four hero specimens (one per beat), each playing its read,
 * then races on. Pure + renderer-free so the choreography is unit-testable
 * without WebGL (mirrors act-beats.ts).
 *
 * Rhythm: one climax (Features) + three restrained — see CLIMAX_BEAT.
 */

import { lerp, smoothstep } from '@/lib/easing';

const SPACING = 3.2; // must match r3f-library-stage
const SPECIMEN_COUNT = 24;

export type LibraryBeat = {
  /** Which of the 24 specimens locks under the lens for this beat. */
  specimen: number;
  kicker: string;
  title: string;
  body: string;
};

export const LIBRARY_BEATS: readonly LibraryBeat[] = [
  {
    specimen: 3,
    kicker: 'Source',
    title: 'Real cases.',
    body: 'Every specimen is a real ISIC case — the image a clinician actually sees, not the textbook ideal.',
  },
  {
    specimen: 9,
    kicker: 'Feedback',
    title: 'The read, not the score.',
    body: 'The pattern behind every call. Never just right or wrong.',
  },
  {
    specimen: 15,
    kicker: 'Features',
    title: 'ABCDE, on the lesion.',
    body: 'Asymmetry, border, colour — lifted off the image, not pinned.',
  },
  {
    specimen: 21,
    kicker: 'Format',
    title: 'Built for clinic time.',
    body: 'Ninety-second reads. A whole session fits a coffee break.',
  },
];

/** Index into LIBRARY_BEATS of the one climax (Features) — the rest stay quiet. */
export const CLIMAX_BEAT = 2;

// Dwell centres in progress; the stage holds the hero centred across
// [at - HOLD, at + HOLD] while the beat reads.
const AT = [0.12, 0.38, 0.62, 0.86] as const;
const HOLD = 0.07;

/**
 * World-space travel distance at progress p. The strip is positioned at
 * `x = specimenIndex * SPACING - travelAt(p)`, so when travel equals a hero's
 * offset that hero sits dead-centre under the lens. Holds at each hero across
 * its dwell, eases between them, and accelerates past the last (the Format
 * "ninety-second" speed gesture) to the end of the strip.
 */
export const travelAt = (p: number): number => {
  const target = (k: number): number => LIBRARY_BEATS[k].specimen * SPACING;

  if (p <= AT[0]) return target(0);
  if (p >= AT[3] + HOLD) {
    return lerp(
      target(3),
      (SPECIMEN_COUNT - 1) * SPACING,
      smoothstep(AT[3] + HOLD, 1, p),
    );
  }
  for (let k = 0; k < 3; k++) {
    if (p <= AT[k] + HOLD) return target(k); // holding on hero k
    if (p < AT[k + 1] - HOLD) {
      return lerp(
        target(k),
        target(k + 1),
        smoothstep(AT[k] + HOLD, AT[k + 1] - HOLD, p),
      );
    }
  }
  return target(3);
};

/** The beat currently locked under the lens, or -1 while the stage is moving. */
export const activeBeat = (p: number): number => {
  for (let k = 0; k < AT.length; k++) {
    if (p >= AT[k] - HOLD && p <= AT[k] + HOLD) return k;
  }
  return -1;
};

/** A beat's reveal 0→1 — full while locked, fading as the stage arrives/leaves. */
export const beatReveal = (beat: number, p: number): number =>
  1 - smoothstep(HOLD * 0.5, HOLD * 1.4, Math.abs(p - AT[beat]));
