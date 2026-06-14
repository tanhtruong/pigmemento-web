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

/**
 * The house ease — `cubic-bezier(0.2, 0.8, 0.2, 1)`. One tuple source, exported
 * in both forms so the motion vocabulary (transitions) and the CSS-driven
 * overlays (the boundary bloom, #43) stay the same material (#63).
 */
const EASE_BEZIER = [0.2, 0.8, 0.2, 1] as const;
export const easeOut: Transition['ease'] = [...EASE_BEZIER];
export const EASE_CSS = `cubic-bezier(${EASE_BEZIER.join(', ')})`;

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
 * Verdict column entry floor (#98). The question→verdict swap fades the incoming
 * column up from this floor — present, not blank — so the `mode="wait"` handoff
 * reads as a quick firm-up rather than an empty gap, with the verdict's own
 * divider-draw covering it. Mirrors the develop LATENT_OPACITY rationale (#82).
 */
export const VERDICT_ENTER_OPACITY = 0.6;

/**
 * The Develop — the in-app route gesture (#53), re-engineered for #59 and
 * quieted for #73.
 *
 * Surfaces move on the compositor only (opacity + transform) — the original
 * whole-subtree `filter` repainted the entire route tree every frame, the real
 * source of the micro-jank. #59 isolated the warmth into a full-bleed amber
 * DevelopWash on case entry; #73 removed that wash entirely (it read as an
 * in-your-face bloom), so every hop is now the same quiet dissolve: a fade from
 * the opacity floor with a whisper of directional drift.
 */

/**
 * How long a route loader may hold navigation before the outgoing surface
 * earns the held fix dim (#54). Cached react-query hops resolve well under
 * this and never show it.
 */
export const PENDING_HOLD_MS = 150;

type DevelopDrift = { x?: number; y?: number };

/**
 * Drift amplitude (#73). A whisper — just enough to signal which way the hop
 * goes, never enough to read as the page sliding. The handoff is a dissolve;
 * the drift only flavours it.
 */
const DRIFT_PX = 8;

/**
 * Drift conjugation per grammar variant. Only the *incoming* surface drifts:
 * lateral hops flow along the tab strip, descend dips into the case, ascend
 * lifts back out, advance presses forward. The outgoing surface only fades, so
 * the two never appear to slide past each other.
 */
const ENTER_DRIFT: Record<RouteTransitionVariant, DevelopDrift> = {
  'lateral-forward': { x: DRIFT_PX },
  'lateral-back': { x: -DRIFT_PX },
  descend: { y: -DRIFT_PX },
  ascend: { y: DRIFT_PX },
  advance: { x: DRIFT_PX },
  neutral: {},
  none: {},
};

const INSTANT: Transition = { duration: 0 };

/**
 * Latent opacity floor (#59, raised for #82). The incoming surface enters at a
 * floor, never full transparency, so the `mode="wait"` swap reads as a quick
 * fade-in rather than a blank flash. (popLayout would overlap the two surfaces
 * for a true crossfade, but it left a stuck, in-flow exited layer in this route
 * tree — phantom scroll height — so we stay on the robust `wait` + floor.)
 *
 * Raised from 0.4 to 0.6: at 0.4 the surface visibly dimmed to near-nothing and
 * climbed back, which read as a flicker between pages. A higher floor keeps the
 * incoming surface mostly present and just firms up, so the hop is a quiet
 * settle rather than a dim-gap-brighten blink. Since #73 removed the
 * DevelopWash, this floor masks the swap on every hop, descend and advance
 * included.
 */
const LATENT_OPACITY = 0.6;

/**
 * Dynamic variants for the route outlet. Pass the hop's grammar variant as
 * `custom` on BOTH the motion element and its AnimatePresence so the exiting
 * surface fixes with the current hop's drift, not the one that brought it in.
 * `none` collapses every state to an instant no-op (centerpiece hop).
 */
export const developVariants: Variants = {
  latent: (variant: RouteTransitionVariant) =>
    variant === 'none'
      ? { opacity: 1, x: 0, y: 0 }
      : { opacity: LATENT_OPACITY, x: 0, y: 0, ...ENTER_DRIFT[variant] },
  developed: (variant: RouteTransitionVariant) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: variant === 'none' ? INSTANT : motionTokens.normal,
  }),
  fixed: (variant: RouteTransitionVariant) =>
    variant === 'none'
      ? { opacity: 1, transition: INSTANT }
      : {
          opacity: 0,
          x: 0,
          y: 0,
          transition: motionTokens.quick,
        },
  /**
   * Held (#54, re-engineered for #59) — a pending loader keeps the outgoing
   * surface mounted, so it eases to a gentle dim and waits there: the click
   * acknowledged without a spinner. Opacity only now (no filter); the slow
   * ramp keeps barely-over-threshold loads from flickering. Since #73 removed
   * the wash, this dim is what every held hop shows.
   */
  held: {
    opacity: 0.82,
    x: 0,
    y: 0,
    transition: motionTokens.considered,
  },
};
