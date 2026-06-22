import { Suspense, lazy, useRef } from 'react';

import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';
import { useActScroll } from './use-act-scroll';

// Lazy so three/r3f/drei stay in the quarantined async `r3f-act-scene` chunk —
// this stage holds only the GSAP scroll engine (allowed in a `landing-*` chunk).
const R3fActScene = lazy(() => import('./r3f-act-scene'));

type LandingActStageProps = {
  imageSrc: string;
  features: AbcdeFeature[];
};

const eyebrow: React.CSSProperties = {
  position: 'absolute',
  top: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  font: '12px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.14em',
  color: '#9a958c',
  textTransform: 'uppercase',
};

const hint: React.CSSProperties = {
  position: 'absolute',
  bottom: '1.5rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  font: '11px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.1em',
  color: '#9a958c',
};

/**
 * Act I stage (#146): the pinned section the ScrollTrigger holds while the take
 * plays. Owns the scroll-progress ref + pin, renders the lazy WebGL scene, and
 * overlays the dermoscopy metadata. Lazy-loaded by the route so its GSAP lands
 * in a `landing-*` chunk.
 */
export default function LandingActStage({
  imageSrc,
  features,
}: LandingActStageProps) {
  const scrollProgressRef = useRef(0);
  const pinRef = useRef<HTMLDivElement>(null);

  useActScroll(scrollProgressRef, pinRef, true);

  return (
    <div
      ref={pinRef}
      style={{
        height: '100dvh',
        position: 'relative',
        background: '#0b0a09',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <R3fActScene
            imageSrc={imageSrc}
            features={features}
            active
            scrollProgressRef={scrollProgressRef}
          />
        </Suspense>
      </div>
      <div style={eyebrow}>ISIC_0000022 · 20× · polarized</div>
      <div style={hint}>scroll to examine ↓</div>
    </div>
  );
}
