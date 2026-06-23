import { Suspense, lazy, useRef } from 'react';

import { useShouldRender3D, usePrefersReducedMotion } from '@/lib/render-3d';
import { useActScroll } from '../landing-scroll';

// The shared landing canvas (#159) — reused so the stage renders into the one
// page-wide WebGL context, never a second one. Lazy + r3f-* / landing-* named so
// three/drei and the gsap scroll engine stay in their allowlisted chunks.
const LandingCanvas = lazy(() => import('../r3f-landing-canvas'));
const R3fLibraryStage = lazy(() => import('./r3f-library-stage'));

/**
 * Specimen-stage orchestrator (#161). Owns the pinned section + the 0→1 scroll
 * progress (the Act's `useActScroll`, reused), mounts the shared canvas, and
 * renders the library scene as a <View> tracking the pinned box. Capable desktop
 * only for now; the reduced-motion static contact-strip is #164.
 */
export default function LandingLibraryStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const capable = useShouldRender3D();
  const reducedMotion = usePrefersReducedMotion();

  // One pin, one 0→1 progress — it drives the horizontal stage travel in the
  // scene's useFrame. A long pin distance gives the 24 specimens room to stream.
  useActScroll(
    progressRef,
    pinRef,
    capable && !reducedMotion,
    undefined,
    '+=320%',
  );

  return (
    <div ref={rootRef} style={{ background: '#0b0a09', color: '#ede8df' }}>
      {capable && (
        <Suspense fallback={null}>
          <LandingCanvas eventSource={rootRef} />
        </Suspense>
      )}

      <div
        ref={pinRef}
        style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}
      >
        {capable ? (
          <Suspense fallback={null}>
            <R3fLibraryStage progressRef={progressRef} />
          </Suspense>
        ) : (
          <div style={fallback}>This preview needs WebGL.</div>
        )}

        <div style={eyebrow}>the library · 24 real ISIC specimens</div>
        {!reducedMotion && (
          <div style={hint}>scroll to browse the library →</div>
        )}
      </div>
    </div>
  );
}

const SCALE = '#9a958c';

const eyebrow: React.CSSProperties = {
  position: 'absolute',
  top: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  font: '12px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.14em',
  color: SCALE,
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
  color: SCALE,
};

const fallback: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  font: '13px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.1em',
  color: SCALE,
};
