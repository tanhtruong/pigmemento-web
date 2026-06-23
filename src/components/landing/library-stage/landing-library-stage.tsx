import { Suspense, lazy, useEffect, useRef } from 'react';

import { useShouldRender3D, usePrefersReducedMotion } from '@/lib/render-3d';
import { useActScroll } from '../landing-scroll';
import { CLIMAX_BEAT, LIBRARY_BEATS, beatReveal } from './library-beats';

// The shared landing canvas (#159) — reused so the stage renders into the one
// page-wide WebGL context, never a second one. Lazy + r3f-* / landing-* named so
// three/drei and the gsap scroll engine stay in their allowlisted chunks.
const LandingCanvas = lazy(() => import('../r3f-landing-canvas'));
const R3fLibraryStage = lazy(() => import('./r3f-library-stage'));

const ABCDE = ['A', 'B', 'C', 'D', 'E'];

/**
 * Specimen-stage orchestrator (#161) + the four lock-in beats (#163). Owns the
 * pin + 0→1 progress (the Act's `useActScroll`, reused), mounts the shared
 * canvas, and renders the library scene. As the stage locks at each hero
 * specimen (see library-beats `travelAt`), the matching beat reads in; the
 * Features beat is the one climax, paired with the A·B·C·D·E margin read over the
 * lens glow. A rAF loop drives the overlay opacities off the scrub ref — no
 * per-frame React renders. Reduced-motion static contact-strip is #164.
 */
export default function LandingLibraryStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const abcdeRef = useRef<HTMLDivElement>(null);

  const capable = useShouldRender3D();
  const reducedMotion = usePrefersReducedMotion();

  // One pin, one 0→1 progress — it drives the lock-in travel in the scene's
  // useFrame. A long pin distance gives the four beats room to read.
  useActScroll(
    progressRef,
    pinRef,
    capable && !reducedMotion,
    undefined,
    '+=360%',
  );

  // Reveal the beat overlays off the scrub progress, every frame, via the DOM
  // (no React re-render) — the locked beat fades in, the rest stay hidden.
  useEffect(() => {
    if (!capable) return;
    let raf = 0;
    const tick = () => {
      const p = progressRef.current;
      for (let k = 0; k < LIBRARY_BEATS.length; k++) {
        const el = beatRefs.current[k];
        if (el) {
          const r = beatReveal(k, p);
          el.style.opacity = String(r);
          el.style.transform = `translate(-50%, ${(1 - r) * 12}px)`;
        }
      }
      if (abcdeRef.current) {
        abcdeRef.current.style.opacity = String(beatReveal(CLIMAX_BEAT, p));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [capable]);

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

        {capable && (
          <>
            {/* A·B·C·D·E reading at the reticle margin — the Features climax. */}
            <div ref={abcdeRef} style={abcdeWrap}>
              {ABCDE.map((letter) => (
                <span key={letter} style={abcdeLetter}>
                  {letter}
                </span>
              ))}
            </div>

            {/* The four beat reads — only the locked one is shown (rAF-driven). */}
            {LIBRARY_BEATS.map((beat, k) => (
              <div
                key={beat.kicker}
                ref={(el) => {
                  beatRefs.current[k] = el;
                }}
                style={k === CLIMAX_BEAT ? beatBlockClimax : beatBlock}
              >
                <p style={beatKicker}>{beat.kicker}</p>
                <p style={k === CLIMAX_BEAT ? beatTitleClimax : beatTitle}>
                  {beat.title}
                </p>
                <p style={beatBody}>{beat.body}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const SCALE = '#9a958c';
const BONE = '#ede8df';
const UMBER = '#b98a5e';

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

const beatBlock: React.CSSProperties = {
  position: 'absolute',
  bottom: '13%',
  left: '50%',
  transform: 'translate(-50%, 12px)',
  zIndex: 3,
  width: 'min(90vw, 30rem)',
  textAlign: 'center',
  opacity: 0,
  pointerEvents: 'none',
};

const beatBlockClimax: React.CSSProperties = {
  ...beatBlock,
  bottom: '11%',
  width: 'min(92vw, 34rem)',
};

const beatKicker: React.CSSProperties = {
  font: '11px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: UMBER,
  margin: '0 0 0.6rem',
};

const beatTitle: React.CSSProperties = {
  font: '500 24px "Fraunces", Georgia, serif',
  color: BONE,
  margin: '0 0 0.5rem',
};

const beatTitleClimax: React.CSSProperties = {
  ...beatTitle,
  font: '600 32px "Fraunces", Georgia, serif',
};

const beatBody: React.CSSProperties = {
  font: '14px ui-sans-serif, "IBM Plex Sans", system-ui, sans-serif',
  color: 'rgba(237,232,223,0.72)',
  margin: '0 auto',
  maxWidth: '36ch',
};

const abcdeWrap: React.CSSProperties = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 3,
  display: 'flex',
  gap: '1.2rem',
  opacity: 0,
  pointerEvents: 'none',
};

const abcdeLetter: React.CSSProperties = {
  font: '600 14px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.1em',
  color: BONE,
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
