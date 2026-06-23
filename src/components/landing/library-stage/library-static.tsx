import { LIBRARY_SPECIMENS } from '@/lib/library-specimens';
import { LIBRARY_BEATS } from './library-beats';

/**
 * The reduced-motion / no-WebGL fallback (#164) — a calm static contact-strip.
 * The four method-points sit beside their real hero specimens, no scrub and no
 * pin: the same reads the animated set-piece delivers, composed instead of
 * scrubbed. Plain DOM (no three/gsap) so it stays out of the quarantined chunks;
 * images lazy-load so they never block first paint.
 */
export default function LibraryStatic() {
  return (
    <section style={section}>
      <p style={eyebrow}>
        the library · {LIBRARY_SPECIMENS.length} real ISIC specimens
      </p>
      <div style={grid}>
        {LIBRARY_BEATS.map((beat) => (
          <article key={beat.kicker}>
            <img
              src={LIBRARY_SPECIMENS[beat.specimen]}
              alt=""
              loading="lazy"
              decoding="async"
              style={img}
            />
            <p style={kicker}>{beat.kicker}</p>
            <h3 style={title}>{beat.title}</h3>
            <p style={body}>{beat.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const BONE = '#ede8df';
const SCALE = '#9a958c';
const UMBER = '#b98a5e';

const section: React.CSSProperties = {
  maxWidth: '1140px',
  margin: '0 auto',
  padding: 'clamp(4rem, 10vh, 8rem) 2rem',
};

const eyebrow: React.CSSProperties = {
  font: '12px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: SCALE,
  textAlign: 'center',
  margin: '0 0 2.6rem',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.75rem',
};

const img: React.CSSProperties = {
  width: '100%',
  aspectRatio: '4 / 3',
  objectFit: 'cover',
  borderRadius: '10px',
  border: '1px solid rgba(237,232,223,0.1)',
  display: 'block',
  marginBottom: '1.1rem',
};

const kicker: React.CSSProperties = {
  font: '11px ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: UMBER,
  margin: '0 0 0.5rem',
};

const title: React.CSSProperties = {
  font: '500 20px "Fraunces", Georgia, serif',
  color: BONE,
  margin: '0 0 0.4rem',
};

const body: React.CSSProperties = {
  font: '14px ui-sans-serif, "IBM Plex Sans", system-ui, sans-serif',
  color: 'rgba(237,232,223,0.72)',
  margin: 0,
  maxWidth: '34ch',
};
