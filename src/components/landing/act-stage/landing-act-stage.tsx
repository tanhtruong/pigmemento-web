import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { usePrefersReducedMotion, useShouldRender3D } from '@/lib/render-3d';
import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';
import { COMMIT_AT } from './act-beats';
import Crafted2DScene from './crafted-2d-scene';
import { useActScroll } from '../landing-scroll';

// Lazy so three/r3f/drei stay in the quarantined async `r3f-act-scene` chunk —
// this stage holds only the GSAP scroll engine (allowed in a `landing-*` chunk).
const R3fActScene = lazy(() => import('./r3f-act-scene'));

type Choice = 'benign' | 'malignant';

type LandingActStageProps = {
  imageSrc: string;
  features: AbcdeFeature[];
  correctLabel: string;
  diagnosis: string;
  /** Dev override (?fallback) to force the crafted 2D path on capable desktop. */
  forceFallback?: boolean;
};

const SCALE = '#9a958c';
const BONE = '#ede8df';
const VEIL = '#7e94a6';
const UMBER = '#b98a5e';
const HAIRLINE = '#3a352f';

/**
 * Act I stage (#146) + the commitment hold and verdict (#147). Owns the
 * scroll-progress ref + pin, renders the lazy WebGL scene, and — once the take
 * reaches the commit beat — prompts the call (Benign / Malignant, also keys
 * B/M). The choice resolves into the verdict, where the blue-white veil is the
 * one and only use of the alarm colour, spent as the consequence of that call.
 */
export default function LandingActStage({
  imageSrc,
  features,
  correctLabel,
  diagnosis,
  forceFallback = false,
}: LandingActStageProps) {
  const scrollProgressRef = useRef(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const [commitReady, setCommitReady] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);

  // Capability gate: the WebGL take only on a capable desktop; everyone else
  // (phone / reduced-data / no-WebGL2 / reduced-motion) gets the crafted 2D
  // path, which carries the same beats + commit + verdict (#148). Reduced-motion
  // composes the final state instead of scrubbing, so it never pins.
  const capable = useShouldRender3D();
  const reducedMotion = usePrefersReducedMotion();
  const use3D = capable && !forceFallback;
  const scrub = !reducedMotion;

  const onProgress = useCallback((p: number) => {
    setCommitReady((prev) => (prev === p >= COMMIT_AT ? prev : p >= COMMIT_AT));
  }, []);

  useActScroll(scrollProgressRef, pinRef, scrub, onProgress);

  // Reduced-motion never scrubs (no pin), so the prompt is available directly.
  const commitActive = commitReady || reducedMotion;

  // Keyboard commit — B / M, while the prompt is up.
  useEffect(() => {
    if (!commitActive || choice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B') setChoice('benign');
      if (e.key === 'm' || e.key === 'M') setChoice('malignant');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commitActive, choice]);

  const showCommit = commitActive && !choice;
  const correct = choice === correctLabel;

  return (
    <div
      ref={pinRef}
      // No background: the shared WebGL canvas (PIG-159) sits *behind* the page
      // and the views show through this section. An opaque fill here would bury
      // the lesion; the dark field comes from the landing root instead. (The
      // crafted-2D fallback brings its own background.)
      style={{
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        {use3D ? (
          <Suspense fallback={null}>
            <R3fActScene
              imageSrc={imageSrc}
              features={features}
              scrollProgressRef={scrollProgressRef}
            />
          </Suspense>
        ) : (
          <Crafted2DScene
            imageSrc={imageSrc}
            features={features}
            scrollProgressRef={scrollProgressRef}
            staticMode={reducedMotion}
          />
        )}
      </div>

      <div style={eyebrow}>ISIC_0000022 · 20× · polarized</div>
      {!commitActive && <div style={hint}>scroll to examine ↓</div>}

      <div
        style={{
          ...commitWrap,
          opacity: showCommit ? 1 : 0,
          pointerEvents: showCommit ? 'auto' : 'none',
        }}
      >
        <div style={commitLabel}>your call</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            style={choiceBtn}
            onClick={() => setChoice('benign')}
          >
            Benign <span style={kbd}>B</span>
          </button>
          <button
            type="button"
            style={choiceBtn}
            onClick={() => setChoice('malignant')}
          >
            Malignant <span style={kbd}>M</span>
          </button>
        </div>
      </div>

      <div
        style={{
          ...verdictWrap,
          opacity: choice ? 1 : 0,
          pointerEvents: choice ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            ...verdictInner,
            transform: choice ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          <div style={diagEyebrow}>diagnosis</div>
          <div style={diagName}>{diagnosis}</div>
          <div style={taxonomy}>melanoma in situ</div>
          <div style={correctness}>
            {correct
              ? `You said ${choice}. Correct.`
              : `You said ${choice}. It’s malignant.`}
          </div>
          <div style={veilNote}>Blue-white veil — the sign you’d act on.</div>
          <div style={breslow}>Breslow 0.6 mm</div>
        </div>
      </div>
    </div>
  );
}

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

const commitWrap: React.CSSProperties = {
  position: 'absolute',
  bottom: '11%',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.85rem',
  transition: 'opacity 0.4s ease',
};

const commitLabel: React.CSSProperties = {
  font: '11px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: SCALE,
};

const choiceBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0.6rem 1.1rem',
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 10,
  background: 'rgba(11,10,9,0.55)',
  backdropFilter: 'blur(6px)',
  color: BONE,
  font: '15px ui-sans-serif, "IBM Plex Sans", system-ui, sans-serif',
  cursor: 'pointer',
};

const kbd: React.CSSProperties = {
  font: '11px ui-monospace, "IBM Plex Mono", monospace',
  color: SCALE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 4,
  padding: '1px 6px',
};

const verdictWrap: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(11,10,9,0.82)',
  backdropFilter: 'blur(3px)',
  transition: 'opacity 0.6s ease',
};

const verdictInner: React.CSSProperties = {
  textAlign: 'center',
  padding: '0 1.5rem',
  transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
};

const diagEyebrow: React.CSSProperties = {
  font: '12px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: SCALE,
  marginBottom: '1rem',
};

const diagName: React.CSSProperties = {
  font: '600 clamp(48px, 9vw, 88px) "Fraunces", Georgia, serif',
  lineHeight: 1,
  color: BONE,
};

const taxonomy: React.CSSProperties = {
  font: 'italic 400 20px "Fraunces", Georgia, serif',
  color: UMBER,
  marginTop: '0.5rem',
};

const correctness: React.CSSProperties = {
  font: '15px ui-sans-serif, "IBM Plex Sans", system-ui, sans-serif',
  color: BONE,
  marginTop: '1.6rem',
};

const veilNote: React.CSSProperties = {
  font: '13px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.04em',
  color: VEIL,
  marginTop: '0.8rem',
};

const breslow: React.CSSProperties = {
  font: '12px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.08em',
  color: SCALE,
  marginTop: '1.4rem',
};
