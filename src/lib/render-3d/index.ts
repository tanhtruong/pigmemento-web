/**
 * Capability-gating for the progressive-enhancement 3D landing (epic #125).
 * Decides static-vs-3D fidelity and exposes the render-loop pause signals, all
 * decoupled from any renderer so the decision is unit-testable without WebGL.
 */
export { shouldRender3D, type Render3DCapabilities } from './should-render-3d';
export { useMediaQuery } from './use-media-query';
export {
  detectWebGL2,
  useWebGL2Support,
  usePrefersReducedMotion,
  usePrefersReducedData,
  useIsPhone,
  useShouldRender3D,
} from './use-capabilities';
export {
  useDocumentVisible,
  useIsIntersecting,
  useRenderLoopActive,
} from './use-render-loop-active';
