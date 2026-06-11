import type { Transition } from 'motion/react';

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
} as const;

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
