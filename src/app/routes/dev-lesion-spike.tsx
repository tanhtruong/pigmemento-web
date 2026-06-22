import { Suspense, lazy, useState } from 'react';

// Lazy so three/r3f/drei stay in the quarantined async `r3f-lesion-spike` chunk
// the bundle guard allowlists — this dev-route chunk must hold no static three.
const R3fLesionSpike = lazy(
  () => import('@/components/landing/case-stage/r3f-lesion-spike'),
);

const IMAGE = '/ISIC_0000022.jpg';

const wrap: React.CSSProperties = {
  minHeight: '100dvh',
  background: '#0b0a09',
  color: '#ede8df',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5rem',
  fontFamily: 'ui-monospace, "IBM Plex Mono", monospace',
};

const frame: React.CSSProperties = {
  position: 'relative',
  width: 'min(80vmin, 520px)',
  aspectRatio: '4 / 5',
  borderRadius: 14,
  overflow: 'hidden',
  boxShadow: '0 30px 90px -30px rgba(0,0,0,0.8)',
};

/**
 * SPIKE route (#144, gated) — /dev/lesion-spike. Throwaway evaluation harness
 * for the dimensional-dermoscopy effect. Move the cursor to rake the light;
 * toggle relief to A/B against the flat photo for the go/no-go call.
 */
export default function DevLesionSpike() {
  const [reliefOn, setReliefOn] = useState(true);

  return (
    <div style={wrap}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.14em',
          color: '#9a958c',
          textTransform: 'uppercase',
        }}
      >
        ISIC_0000022 · 20× · dimensional dermoscopy spike
      </div>

      <div style={frame}>
        <Suspense
          fallback={
            <img
              src={IMAGE}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          }
        >
          <R3fLesionSpike imageSrc={IMAGE} reliefOn={reliefOn} />
        </Suspense>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: 12, color: '#9a958c' }}>
          move the cursor to rake the light
        </span>
        <button
          type="button"
          onClick={() => setReliefOn((v) => !v)}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            letterSpacing: '0.04em',
            color: '#ede8df',
            background: 'transparent',
            border: '1px solid #3a352f',
            borderRadius: 8,
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
          }}
        >
          {reliefOn ? 'relief: on' : 'relief: off (flat)'}
        </button>
      </div>
    </div>
  );
}
