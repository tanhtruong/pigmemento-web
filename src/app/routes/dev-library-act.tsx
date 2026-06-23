import { Suspense, lazy } from 'react';

// Lazy so the gsap-driven orchestrator lands in its `landing-*` chunk and the
// three scene in the `r3f-*` chunk — this dev route chunk stays clean of both.
const LandingLibraryStage = lazy(
  () => import('@/components/landing/library-stage/landing-library-stage'),
);

/**
 * SPIKE route (#161) — /dev/library-act. Staging harness for the specimen stage:
 * scroll to slide the 24-specimen library horizontally behind the fixed reticle.
 * Lens optics (#162) and the four lock-in beats (#163) land on top of this.
 */
export default function DevLibraryAct() {
  return (
    <div style={{ background: '#0b0a09', color: '#ede8df' }}>
      <Suspense fallback={<div style={{ height: '100dvh' }} />}>
        <LandingLibraryStage />
      </Suspense>
      <section
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '13px ui-monospace, monospace',
          letterSpacing: '0.1em',
          color: '#5f5a52',
        }}
      >
        — #161 the stage · lens DoF (#162) + the four lock-in beats (#163) land
        here —
      </section>
    </div>
  );
}
