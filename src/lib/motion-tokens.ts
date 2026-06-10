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
} as const;

export type MotionTokenName = keyof typeof motionTokens;
