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
  /** Shared-element lesion flight (#67) — docks just after the page settles. */
  flight: 0.34,
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
  /**
   * Shared-element lesion flight (#67) — the Library thumb morphing into the
   * attempt hero. Faster than `considered` so the print docks just as the
   * surrounding page finishes its dissolve, reading as the one continuous
   * thread rather than a flight over a settled page.
   */
  flight: {
    duration: motionDurations.flight,
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
 * The handoff (#65) — the in-app route gesture. One surface crossfades into
 * the next: the incoming surface fades up from a whisper of directional drift,
 * the outgoing one fades straight out. No colour-matrix wash, no contrast
 * ramp — opacity and an 8px nudge only, so the screen change reads as seamless
 * rather than a darkroom print developing in your face.
 *
 * (Earlier revisions #53/#54 ran a sepia "Develop" filter here; it read as a
 * full-page bloom and was removed.)
 */

/**
 * How long a route loader may hold navigation before the outgoing surface
 * earns the held dim (#54). Cached react-query hops resolve well under this
 * and never show it.
 */
export const PENDING_HOLD_MS = 150;

type DevelopDrift = { x?: number; y?: number };

/**
 * Drift amplitude (#65). A whisper — just enough to signal which way the hop
 * goes, never enough to read as the page sliding. The handoff is a crossfade;
 * the drift only flavours it.
 */
const DRIFT_PX = 8;

/**
 * Opacity floor for the dissolve (#65). The leaving surface fades DOWN to this
 * and the arriving one fades UP from it — never to a blank frame. At the swap
 * both surfaces sit at the floor, so the content change is masked the way a
 * crossfade's midpoint masks it, without two route trees mounted at once.
 */
const DISSOLVE_FLOOR = 0.5;

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
 * Dynamic variants for the route outlet. Pass the hop's grammar variant as
 * `custom` on BOTH the motion element and its AnimatePresence so the exiting
 * surface fades with the current hop's grammar, not the one that brought it in.
 *
 * The handoff is a dissolve that never blanks (#65): `fixed` fades the leaving
 * surface DOWN to the floor, `latent` starts the arriving one AT the floor and
 * `developed` lifts it to full. `none` collapses every state to an instant
 * no-op (centerpiece hop).
 */
export const developVariants: Variants = {
  latent: (variant: RouteTransitionVariant) =>
    variant === 'none'
      ? { opacity: 1, x: 0, y: 0 }
      : {
          opacity: DISSOLVE_FLOOR,
          x: 0,
          y: 0,
          ...ENTER_DRIFT[variant],
        },
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
          opacity: DISSOLVE_FLOOR,
          x: 0,
          y: 0,
          transition: motionTokens.quick,
        },
  /**
   * Held dim (#54) — a pending loader keeps the outgoing surface mounted, so
   * it eases into a gentle opacity dim and waits there: the click acknowledged
   * without a spinner. A slow ramp keeps barely-over-threshold loads from
   * flickering. Sustained, so it sits a touch brighter than the transient
   * dissolve floor. No drift, no colour wash (#65) — just a quiet fade-back.
   */
  held: {
    opacity: 0.7,
    x: 0,
    y: 0,
    transition: motionTokens.considered,
  },
};
