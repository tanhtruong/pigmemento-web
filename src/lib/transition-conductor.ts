/**
 * Pure state machine for the route-transition conductor (#43).
 *
 * The conductor narrates every hop across the landing/auth/app boundary as
 * one amber gesture: bloom from the user's commit point, hold while the
 * router swaps underneath, dissolve into the destination's resting surface.
 *
 * This module is framework-free on purpose — timers, navigation, and the
 * overlay rendering live in the React layer. The machine only answers
 * "what phase are we in, and which transition is running?".
 */

import { motionDurations } from './motion-tokens';

export type TransitionKind = 'enter-auth' | 'enter-app' | 'exit-app';

export type TransitionRequest = {
  kind: TransitionKind;
  /** Viewport coordinates of the commit gesture — the bloom's origin. */
  origin: { x: number; y: number };
  destination: string;
};

export type ConductorPhase = 'idle' | 'blooming' | 'holding' | 'dissolving';

export type ConductorState = {
  phase: ConductorPhase;
  /** The running transition; null exactly when idle. */
  transition: TransitionRequest | null;
  /**
   * Bumped on every START. Timer-driven events carry the generation they
   * were scheduled under; a mismatch means the transition was cancelled
   * and the event is stale — ignored.
   */
  generation: number;
};

export type ConductorEvent =
  | { type: 'START'; request: TransitionRequest }
  | { type: 'APEX_REACHED'; generation: number }
  | { type: 'LOCATION_CHANGED' }
  | { type: 'DISSOLVE_DONE'; generation: number };

export const initialConductorState: ConductorState = {
  phase: 'idle',
  transition: null,
  generation: 0,
};

export const reduceConductor = (
  state: ConductorState,
  event: ConductorEvent,
): ConductorState => {
  switch (event.type) {
    case 'START':
      return {
        phase: 'blooming',
        transition: event.request,
        generation: state.generation + 1,
      };
    case 'APEX_REACHED':
      if (event.generation !== state.generation) return state;
      return { ...state, phase: 'holding' };
    case 'LOCATION_CHANGED':
      // Only meaningful while holding — that's the one phase where the
      // conductor itself asked for a navigation. Anything else (ordinary
      // route changes, a back-button race mid-bloom) is not ours to narrate.
      if (state.phase !== 'holding') return state;
      return { ...state, phase: 'dissolving' };
    case 'DISSOLVE_DONE':
      if (event.generation !== state.generation) return state;
      return { ...state, phase: 'idle', transition: null };
  }
};

/**
 * Fraction of the bloom disc's radius that is fully opaque; the remaining
 * rim feathers to transparent. The disc is sized so this solid core — not
 * the feathered rim — reaches the farthest viewport corner at apex.
 */
export const BLOOM_SOLID_CORE = 0.7;

/**
 * Square bounding box for the bloom disc: centered on the commit gesture,
 * large enough that the opaque core covers the entire viewport at apex.
 */
export const bloomGeometry = (
  origin: { x: number; y: number },
  viewport: { width: number; height: number },
): { size: number; left: number; top: number } => {
  const farthestCorner = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(viewport.width - origin.x, origin.y),
    Math.hypot(origin.x, viewport.height - origin.y),
    Math.hypot(viewport.width - origin.x, viewport.height - origin.y),
  );
  const radius = farthestCorner / BLOOM_SOLID_CORE;
  return { size: radius * 2, left: origin.x - radius, top: origin.y - radius };
};

/**
 * Conductor phase durations, sourced from the shared motion vocabulary.
 * Under `prefers-reduced-motion` the same machine runs with zero-length
 * phases — instant cuts, identical outcomes.
 */
export const conductorTimings = (reducedMotion: boolean) => {
  if (reducedMotion) return { bloomMs: 0, dissolveMs: 0 };
  return {
    bloomMs: motionDurations.considered * 1000,
    dissolveMs: motionDurations.hero * 1000,
  };
};

/**
 * True exactly when the machine crosses into `holding` — the single moment
 * the React layer is allowed to call `navigate()`. The route swap happens
 * under the fully-opaque overlay.
 */
export const shouldFireNavigate = (
  prev: ConductorState,
  next: ConductorState,
): boolean => {
  return prev.phase !== 'holding' && next.phase === 'holding';
};

/**
 * History semantics per transition kind. Crossing the auth boundary spends
 * the step — back must not replay a sign-in or re-enter a dead session.
 * Only landing → auth keeps a history entry behind it.
 */
export const shouldReplaceHistory = (kind: TransitionKind): boolean => {
  return kind !== 'enter-auth';
};
