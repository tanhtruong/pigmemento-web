import { Suspense, lazy } from 'react';

import { case001Breakdown, heroCase } from '@/lib/landing-seed-data';

// Lazy so the GSAP-driven stage lands in its own `landing-*` chunk (and three in
// the further `r3f-*` chunk) — this dev route chunk stays clean of both.
const LandingActStage = lazy(
  () => import('@/components/landing/act-stage/landing-act-stage'),
);

/**
 * SPIKE route (#146) — /dev/lesion-act. Staging harness for the pinned cinematic
 * take: scroll to dolly the camera, sweep the raking light, and reveal the
 * graticule reading. Act I stops before the commit/verdict (#147); the page
 * chrome + release act are #145.
 */
export default function DevLesionAct() {
  return (
    <div style={{ background: '#0b0a09', color: '#ede8df' }}>
      <Suspense fallback={<div style={{ height: '100dvh' }} />}>
        <LandingActStage
          imageSrc={heroCase.imageSrc}
          features={case001Breakdown.features}
          correctLabel={heroCase.correctLabel}
          diagnosis={case001Breakdown.diagnosis}
        />
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
        — release · method / proof / CTA land here (#145) —
      </section>
    </div>
  );
}
