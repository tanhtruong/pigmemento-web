import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import type { RefObject } from 'react';

/**
 * The single shared WebGL renderer for the whole landing (PIG-159). One context,
 * page-wide: the Act — and later the specimen library — each render into it as a
 * drei `<View>` that tracks its own DOM box. A fixed, `pointer-events:none`
 * canvas overlays the page; every `<View>` scissors to the element it tracks, so
 * the regions outside a view stay transparent and the DOM shows through.
 *
 * This replaces the per-section `<Canvas>` the Act used to own — two heavy
 * contexts on one page is the mobile failure mode the set-piece must avoid.
 *
 * Lazy-loaded and `r3f-*` named so three/r3f/drei stay in the quarantined async
 * chunk (see scripts/check-bundles.mjs) — never the landing first-paint chunk.
 */
export default function LandingCanvas({
  eventSource,
}: {
  eventSource: RefObject<HTMLElement | null>;
}) {
  return (
    <Canvas
      aria-hidden
      eventSource={eventSource as RefObject<HTMLElement>}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <View.Port />
    </Canvas>
  );
}
