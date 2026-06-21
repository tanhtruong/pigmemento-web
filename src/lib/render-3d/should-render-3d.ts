/**
 * The four eligibility gates that decide whether the landing case-stage renders
 * as progressive-enhancement 3D or as the static-first fallback.
 *
 * These are the gates that pick a *fidelity* (static vs 3D) for the session.
 * The render-loop pause signals — tab visibility and canvas intersection — are
 * intentionally NOT here: a hidden tab or off-screen canvas pauses the loop, it
 * does not tear the canvas down to static. See `use-render-loop-active`.
 */
export type Render3DCapabilities = {
  /** A WebGL2 rendering context can be created. */
  hasWebGL2: boolean;
  /** `prefers-reduced-motion: reduce` is set. */
  prefersReducedMotion: boolean;
  /** `Save-Data` / `prefers-reduced-data: reduce` is set. */
  prefersReducedData: boolean;
  /** Coarse pointer on a small viewport — a phone. */
  isPhone: boolean;
};

/**
 * Pure eligibility predicate: 3D renders only on a capable desktop where every
 * gate passes. Any failing gate resolves to "render static". Decoupled from
 * React and WebGL so the decision is exhaustively unit-testable.
 */
export const shouldRender3D = (capabilities: Render3DCapabilities): boolean =>
  capabilities.hasWebGL2 &&
  !capabilities.prefersReducedMotion &&
  !capabilities.prefersReducedData &&
  !capabilities.isPhone;
