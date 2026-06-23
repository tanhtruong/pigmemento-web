import { Suspense, lazy, useEffect, useRef } from 'react';
import { Link } from 'react-router';

import { Head } from '@/components/seo/head.tsx';
import { paths } from '@/config/paths';
import { useShouldRender3D } from '@/lib/render-3d';
import { case001Breakdown, faqs, heroCase } from '@/lib/landing-seed-data.tsx';

// Lazy so the GSAP-driven Act + its three/r3f scene stay out of the landing
// first-paint chunk (the static hero + release sections below render without
// them); the bundle guard keeps GSAP/three in their allowed chunks.
const LandingActStage = lazy(
  () => import('@/components/landing/act-stage/landing-act-stage'),
);
// The single shared WebGL context for the whole landing (PIG-159) — the Act and
// (later) the specimen library render into it as drei <View>s. Lazy + r3f-* so
// three/r3f/drei stay quarantined out of the first-paint chunk.
const LandingCanvas = lazy(
  () => import('@/components/landing/r3f-landing-canvas'),
);
// Dev-only: proves a second scene shares the one canvas (slice-0 go/no-go).
const PlaceholderView = lazy(
  () => import('@/components/landing/r3f-placeholder-view'),
);

const METHOD = [
  {
    kicker: 'Source',
    title: 'Real cases',
    body: 'From the ISIC Archive — the image a clinician actually sees, not the textbook ideal.',
  },
  {
    kicker: 'Feedback',
    title: 'Teaches, not scores',
    body: 'The pattern reasoning behind every call. Not just right or wrong.',
  },
  {
    kicker: 'Features',
    title: 'ABCDE on the lesion',
    body: 'The decision-driving features, marked where they sit.',
  },
  {
    kicker: 'Format',
    title: 'Built for clinic time',
    body: 'Ninety-second drills. A session fits a coffee break.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
    {
      '@type': 'Organization',
      name: 'Pigmemento',
      url: 'https://pigmemento.app',
    },
  ],
};

/**
 * The landing page (#149 cutover) — the cinematic "dimensional dermoscopy"
 * reinvention. A static-first hero + the pinned Act (examine → commit → verdict,
 * WebGL on capable desktop, a crafted 2D path everywhere else) + the release
 * act. Self-contained: brings its own dark chrome and the new visual system
 * (melanin palette, Fraunces × IBM Plex), so it no longer rides PublicLayout.
 */
export default function LandingRoute() {
  useEffect(() => {
    document.body.classList.add('dark');
    return () => {
      document.body.classList.remove('dark');
    };
  }, []);

  // One WebGL context for the whole page: mount the shared canvas only for
  // capable clients (the same gate the Act uses), and use the landing root as
  // its pointer event source. Incapable / reduced-motion clients never mount it
  // and get the Act's crafted-2D path, exactly as before.
  const rootRef = useRef<HTMLDivElement>(null);
  const capable = useShouldRender3D();

  return (
    <div className="landing" ref={rootRef}>
      <Head
        title="Pigmemento — melanoma recognition, case by case"
        description="Real dermoscopic cases. Commit to a diagnosis, then see exactly what you missed. Educational use only."
      />
      <style>{CSS}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a className="ln-skip" href="#start">
        Skip to start
      </a>

      {capable && (
        <Suspense fallback={null}>
          <LandingCanvas eventSource={rootRef} />
          {import.meta.env.DEV && <PlaceholderView />}
        </Suspense>
      )}

      <header className="ln-head">
        <span className="ln-wordmark">Pigmemento</span>
        <Link className="ln-btn ln-btn--ghost" to={paths.auth.register.path}>
          Start a case
        </Link>
      </header>

      <section className="ln-intro">
        <p className="ln-eyebrow">Melanoma recognition · case by case</p>
        <h1 className="ln-display">Make the call.</h1>
        <p className="ln-lede">
          Real dermoscopic cases. Commit to a diagnosis, then see exactly what
          you missed.
        </p>
        <div className="ln-actions">
          <Link className="ln-btn" to={paths.auth.register.path}>
            Start a case
          </Link>
          <span className="ln-scrollcue">Scroll to examine the case ↓</span>
        </div>
      </section>

      <Suspense fallback={<div style={{ minHeight: '100dvh' }} />}>
        <LandingActStage
          imageSrc={heroCase.imageSrc}
          features={case001Breakdown.features}
          correctLabel={heroCase.correctLabel}
          diagnosis={case001Breakdown.diagnosis}
        />
      </Suspense>

      <section className="ln-bridge" aria-label="At a glance">
        <p className="ln-bridge-line">One verdict. Now the archive.</p>
        <div className="ln-trust">
          <span>2,000+ cases</span>
          <span>ISIC Archive</span>
          <span>Built with dermatologists</span>
          <span>Educational use only</span>
        </div>
      </section>

      <section className="ln-method">
        <h2 className="ln-h2">Looking, made knowing.</h2>
        <div className="ln-grid">
          {METHOD.map((m) => (
            <article key={m.kicker} className="ln-card">
              <p className="ln-kicker">{m.kicker}</p>
              <h3 className="ln-card-title">{m.title}</h3>
              <p className="ln-card-body">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ln-faq">
        <h2 className="ln-h2">Questions, answered.</h2>
        <div className="ln-faq-list">
          {faqs.map((f) => (
            <details key={f.id} className="ln-faq-item">
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="start" className="ln-cta">
        <p className="ln-eyebrow">For GPs · for trainees · for OSCE prep</p>
        <h2 className="ln-display ln-cta-title">Ready to make the call?</h2>
        <Link className="ln-btn ln-btn--lg" to={paths.auth.register.path}>
          Start your first case
        </Link>
      </section>

      <footer className="ln-foot">
        <span>Pigmemento</span>
        <span className="ln-disclaimer">
          Educational use only. Not for diagnosis.
        </span>
      </footer>
    </div>
  );
}

const CSS = `
.landing {
  --field: #0b0a09;
  --bone: #ede8df;
  --umber: #6b4a2f;
  --veil: #7e94a6;
  --scale: #9a958c;
  --hair: rgba(237,232,223,0.1);
  --serif: 'Fraunces', Georgia, serif;
  --sans: 'IBM Plex Sans', system-ui, sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, monospace;
  background: var(--field);
  color: var(--bone);
  font-family: var(--sans);
  line-height: 1.6;
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}
.landing * { box-sizing: border-box; }
.landing a { text-decoration: none; }
.ln-skip {
  position: absolute; left: -9999px; top: 0; z-index: 10;
  background: var(--bone); color: var(--field); padding: 0.6rem 1rem; border-radius: 8px;
}
.ln-skip:focus { left: 1rem; top: 1rem; }
.ln-eyebrow {
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--scale); margin: 0 0 1.2rem;
}
.ln-display {
  font-family: var(--serif); font-weight: 600; line-height: 0.98;
  font-size: clamp(52px, 8vw, 104px); letter-spacing: -0.01em; margin: 0;
}
.ln-h2 {
  font-family: var(--serif); font-weight: 400; font-size: clamp(28px, 4vw, 44px);
  letter-spacing: -0.01em; margin: 0 0 2.4rem;
}
.ln-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--sans); font-size: 15px; font-weight: 500;
  padding: 0.7rem 1.3rem; border-radius: 10px;
  background: var(--bone); color: var(--field); transition: opacity 0.2s ease;
}
.ln-btn:hover { opacity: 0.88; }
.ln-btn--ghost {
  background: transparent; color: var(--bone);
  border: 1px solid var(--hair); padding: 0.5rem 1rem; font-size: 13px;
}
.ln-btn--lg { font-size: 17px; padding: 0.9rem 1.7rem; }
.ln-scrollcue { font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; color: var(--scale); }

.ln-head {
  position: absolute; top: 0; left: 0; right: 0; z-index: 5;
  display: flex; align-items: center; justify-content: space-between;
  max-width: 1140px; margin: 0 auto; padding: 1.5rem 2rem;
}
.ln-wordmark { font-family: var(--mono); font-size: 14px; letter-spacing: 0.08em; }

.ln-intro {
  max-width: 1140px; margin: 0 auto; min-height: 100dvh;
  display: flex; flex-direction: column; justify-content: center; padding: 2rem;
}
.ln-lede {
  font-size: clamp(17px, 1.6vw, 20px); color: rgba(237,232,223,0.78);
  max-width: 34ch; margin: 1.6rem 0 2.4rem;
}
.ln-actions { display: flex; align-items: center; gap: 1.4rem; flex-wrap: wrap; }

.ln-bridge {
  max-width: 1140px; margin: 0 auto; padding: clamp(3rem, 9vh, 6rem) 2rem; text-align: center;
}
.ln-bridge-line {
  font-family: var(--serif); font-weight: 400; font-size: clamp(22px, 3.4vw, 38px);
  letter-spacing: -0.01em; margin: 0 0 2rem; color: var(--bone);
}
/* The bridge: the Act's blue-white veil cools to bone as you scroll from the
   verdict into the archive — the alarm colour spent, handing off one → many. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .ln-bridge-line {
      animation: ln-bridge-drain linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 45%;
    }
    @keyframes ln-bridge-drain {
      from { color: var(--veil); }
      to { color: var(--bone); }
    }
  }
}
.ln-trust {
  display: flex; flex-wrap: wrap; gap: 1.5rem 2.5rem; justify-content: center;
  padding: 1.6rem 0 0; border-top: 1px solid var(--hair);
  font-family: var(--mono); font-size: 12.5px; letter-spacing: 0.06em; color: var(--scale);
}

.ln-method { max-width: 1140px; margin: 0 auto; padding: clamp(4rem, 10vh, 8rem) 2rem; }
.ln-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--hair); border: 1px solid var(--hair); border-radius: 14px; overflow: hidden; }
.ln-card { background: var(--field); padding: 2rem; }
.ln-kicker { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--umber); margin: 0 0 1rem; }
.ln-card-title { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 0.6rem; }
.ln-card-body { color: rgba(237,232,223,0.72); margin: 0; max-width: 32ch; }

.ln-faq { max-width: 760px; margin: 0 auto; padding: clamp(3rem, 8vh, 6rem) 2rem; }
.ln-faq-item { border-top: 1px solid var(--hair); padding: 1.1rem 0; }
.ln-faq-item:last-child { border-bottom: 1px solid var(--hair); }
.ln-faq-item summary { cursor: pointer; list-style: none; font-size: 17px; color: var(--bone); display: flex; justify-content: space-between; gap: 1rem; }
.ln-faq-item summary::-webkit-details-marker { display: none; }
.ln-faq-item summary::after { content: '+'; font-family: var(--mono); color: var(--scale); }
.ln-faq-item[open] summary::after { content: '–'; }
.ln-faq-item p { color: rgba(237,232,223,0.72); margin: 0.9rem 0 0; max-width: 60ch; }

.ln-cta { text-align: center; max-width: 1140px; margin: 0 auto; padding: clamp(4rem, 12vh, 9rem) 2rem; }
.ln-cta-title { margin: 0 0 2.2rem; }

.ln-foot {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  max-width: 1140px; margin: 0 auto; padding: 2rem; border-top: 1px solid var(--hair);
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; color: var(--scale);
}

@media (max-width: 800px) {
  .ln-grid { grid-template-columns: 1fr; }
}
`;
