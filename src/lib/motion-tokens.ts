import type { Transition, Variants } from 'motion/react';

import type { RouteTransitionVariant } from '@/lib/route-transition';

/**
 * Shared motion vocabulary for the Pigmemento motion system.
 * Every duration and easing used in motion code (motion v12 or GSAP) MUST come
 * from this module. Inline literals defeat the point.
 */

export const motionDurations = {
  quick: 0.12,
  normal: 0.24,
  considered: 0.42,
  hero: 0.72,
} as const;

const easeOut: Transition['ease'] = [0.2, 0.8, 0.2, 1];

export const motionTokens = {
  quick: {
    duration: motionDurations.quick,
    ease: easeOut,
  } satisfies Transition,
  normal: {
    duration: motionDurations.normal,
    ease: easeOut,
  } satisfies Transition,
  considered: {
    duration: motionDurations.considered,
    ease: easeOut,
  } satisfies Transition,
  hero: {
    type: 'spring',
    stiffness: 180,
    damping: 22,
  } satisfies Transition,
  /** Tap-lift on choice cards and primary buttons — feels tactile, not bouncy. */
  tapLift: {
    type: 'spring',
    stiffness: 350,
    damping: 28,
  } satisfies Transition,
  /** Streak number punch — overshoots intentionally so it lands with weight. */
  streakPunch: {
    type: 'spring',
    stiffness: 420,
    damping: 18,
  } satisfies Transition,
  /** Page transition between app routes — slide-up + fade. */
  pageTransition: {
    duration: 0.3,
    ease: easeOut,
  } satisfies Transition,
  /**
   * Rejection shake — one brief horizontal jolt on a failed commit (wrong
   * credentials). Pair with SHAKE_KEYFRAMES_X. Subtle by design; disabled
   * entirely under reduced motion.
   */
  shake: {
    duration: 0.18,
    ease: easeOut,
  } satisfies Transition,
} as const;

/** Two-cycle horizontal jolt, decaying, returns to rest. Max 6px. */
export const SHAKE_KEYFRAMES_X = [0, -6, 6, -4, 4, 0];

export type MotionTokenName = keyof typeof motionTokens;

/**
 * Hairline ring-fill duration (clockwise sweep around a chosen card on commit).
 * The ring closes; the reveal sequence begins immediately after.
 */
export const RING_FILL_MS = 350;

/**
 * Reveal sequence beats — case-attempt → answer reveal (~1.6s total).
 * All values in milliseconds. Use these as the delay= prop on staged motion.
 */
export const revealSequence = {
  divider: 0,
  dividerDuration: 220,
  eyebrow: 150,
  diagnosis: 300,
  diagnosisCharStaggerMs: 24,
  diagnosisCharRise: 8, // px
  correctness: 550,
  teaching: 700,
  annotationStart: 900,
  annotationStaggerMs: 180,
} as const;

/** Streak-milestone glow decay (amber halo around the punched number). */
export const STREAK_GLOW_DECAY_MS = 1400;

/**
 * The Develop — the in-app route gesture (#53), the bloom conductor's quieter
 * sibling. The incoming surface is a *latent* print: faintly warm (sub-amber
 * safelight cast via sepia), washed-out, and it develops to full contrast.
 * The outgoing surface is *fixed*: cooled, dimmed, done.
 *
 * Filter lists keep identical function order across all three states so
 * motion can interpolate them. Color-matrix filters only (no blur) — these
 * stay compositor-friendly on full route trees.
 */
const LATENT_FILTER =
  'contrast(0.82) saturate(0.72) sepia(0.18) brightness(1.05)';
const DEVELOPED_FILTER = 'contrast(1) saturate(1) sepia(0) brightness(1)';
const FIXED_FILTER = 'contrast(0.94) saturate(0.55) sepia(0) brightness(0.92)';

type DevelopDrift = { x?: number; y?: number };

/**
 * Drift conjugation per grammar variant. Enter and exit continue the same
 * camera motion: lateral hops flow along the tab strip, descend washes
 * downward into the case, ascend lifts back out, advance presses forward.
 */
const ENTER_DRIFT: Record<RouteTransitionVariant, DevelopDrift> = {
  'lateral-forward': { x: 20 },
  'lateral-back': { x: -20 },
  descend: { y: -16 },
  ascend: { y: 16 },
  advance: { x: 16 },
  neutral: {},
  none: {},
};

const EXIT_DRIFT: Record<RouteTransitionVariant, DevelopDrift> = {
  'lateral-forward': { x: -10 },
  'lateral-back': { x: 10 },
  descend: { y: 8 },
  ascend: { y: -8 },
  advance: { x: -8 },
  neutral: {},
  none: {},
};

const INSTANT: Transition = { duration: 0 };

/**
 * Dynamic variants for the route outlet. Pass the hop's grammar variant as
 * `custom` on BOTH the motion element and its AnimatePresence so the exiting
 * surface fixes with the current hop's drift, not the one that brought it in.
 * `none` collapses every state to an instant no-op (centerpiece hop).
 */
export const developVariants: Variants = {
  latent: (variant: RouteTransitionVariant) =>
    variant === 'none'
      ? { opacity: 1, x: 0, y: 0, filter: DEVELOPED_FILTER }
      : {
          opacity: 0,
          filter: LATENT_FILTER,
          x: 0,
          y: 0,
          ...ENTER_DRIFT[variant],
        },
  developed: (variant: RouteTransitionVariant) => ({
    opacity: 1,
    x: 0,
    y: 0,
    filter: DEVELOPED_FILTER,
    transition: variant === 'none' ? INSTANT : motionTokens.normal,
  }),
  fixed: (variant: RouteTransitionVariant) =>
    variant === 'none'
      ? { opacity: 1, transition: INSTANT }
      : {
          opacity: 0,
          filter: FIXED_FILTER,
          ...EXIT_DRIFT[variant],
          transition: motionTokens.quick,
        },
};
