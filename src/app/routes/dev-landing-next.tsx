import { useEffect } from 'react';

import { faqs } from '@/lib/landing-seed-data';

/**
 * #145 staging — /dev/landing-next. The re-skinned, re-voiced *static* landing
 * in the new authored direction (melanin palette, Fraunces × IBM Plex, clinical
 * minimalism). This is the static-first floor the cinematic Act I mounts onto at
 * cutover (#149); the hero lesion here is the still that the WebGL take replaces
 * on a capable desktop. Self-contained + scoped (no global token changes yet).
 */

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

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap';

export default function DevLandingNext() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="lnext">
      <style>{CSS}</style>

      <header className="ln-head">
        <span className="ln-wordmark">Pigmemento</span>
        <a className="ln-btn ln-btn--ghost" href="#start">
          Start a case
        </a>
      </header>

      <main>
        <section className="ln-hero">
          <div className="ln-hero-copy">
            <p className="ln-eyebrow">Melanoma recognition · case by case</p>
            <h1 className="ln-display">Make the call.</h1>
            <p className="ln-lede">
              Real dermoscopic cases. Commit to a diagnosis, then see exactly
              what you missed.
            </p>
            <div className="ln-actions">
              <a className="ln-btn" href="#start">
                Start a case
              </a>
              <a className="ln-btn ln-btn--text" href="#method">
                See how it reads ↓
              </a>
            </div>
          </div>
          <figure className="ln-specimen">
            <div className="ln-frame">
              <img
                src="/ISIC_0000022.jpg"
                alt="Dermoscopic image of a pigmented skin lesion"
              />
              <span className="ln-graticule" aria-hidden="true" />
            </div>
            <figcaption className="ln-credit">
              ISIC_0000022 · courtesy ISIC Archive
            </figcaption>
          </figure>
        </section>

        <section className="ln-trust" aria-label="At a glance">
          <span>2,000+ cases</span>
          <span>ISIC Archive</span>
          <span>Built with dermatologists</span>
          <span>Educational use only</span>
        </section>

        <section id="method" className="ln-method">
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
          <a className="ln-btn ln-btn--lg" href="#start">
            Start your first case
          </a>
        </section>
      </main>

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
.lnext {
  --field: #0b0a09;
  --raise: #131210;
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
.lnext * { box-sizing: border-box; }
.lnext a { text-decoration: none; }
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
  background: var(--bone); color: var(--field);
  transition: opacity 0.2s ease;
}
.ln-btn:hover { opacity: 0.88; }
.ln-btn--ghost {
  background: transparent; color: var(--bone);
  border: 1px solid var(--hair); padding: 0.5rem 1rem; font-size: 13px;
}
.ln-btn--text { background: transparent; color: var(--scale); padding: 0.7rem 0.4rem; }
.ln-btn--lg { font-size: 17px; padding: 0.9rem 1.7rem; }

.ln-head {
  display: flex; align-items: center; justify-content: space-between;
  max-width: 1140px; margin: 0 auto; padding: 1.5rem 2rem;
}
.ln-wordmark { font-family: var(--mono); font-size: 14px; letter-spacing: 0.08em; }

.ln-hero {
  max-width: 1140px; margin: 0 auto; padding: clamp(3rem, 8vh, 7rem) 2rem;
  display: grid; grid-template-columns: 1.05fr 0.95fr; gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
}
.ln-lede {
  font-size: clamp(17px, 1.6vw, 20px); color: rgba(237,232,223,0.78);
  max-width: 34ch; margin: 1.6rem 0 2.2rem;
}
.ln-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.ln-specimen { margin: 0; }
.ln-frame {
  position: relative; aspect-ratio: 4 / 5; border-radius: 14px; overflow: hidden;
  box-shadow: 0 40px 90px -40px rgba(0,0,0,0.8); border: 1px solid var(--hair);
}
.ln-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ln-graticule {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(closest-side, transparent 64%, rgba(154,149,140,0.16) 64.4%, transparent 66%),
    radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(11,10,9,0.55) 100%);
}
.ln-graticule::before, .ln-graticule::after {
  content: ''; position: absolute; background: rgba(201,195,184,0.5);
}
.ln-graticule::before { left: 50%; top: calc(50% - 11px); width: 1px; height: 22px; transform: translateX(-0.5px); }
.ln-graticule::after { top: 50%; left: calc(50% - 11px); height: 1px; width: 22px; transform: translateY(-0.5px); }
.ln-credit {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--scale); margin-top: 0.9rem;
}

.ln-trust {
  display: flex; flex-wrap: wrap; gap: 1.5rem 2.5rem; justify-content: center;
  max-width: 1140px; margin: 0 auto; padding: 1.6rem 2rem;
  border-top: 1px solid var(--hair); border-bottom: 1px solid var(--hair);
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
.ln-faq-item summary {
  cursor: pointer; list-style: none; font-size: 17px; color: var(--bone);
  display: flex; justify-content: space-between; gap: 1rem;
}
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
  .ln-hero { grid-template-columns: 1fr; }
  .ln-specimen { order: -1; max-width: 360px; }
  .ln-grid { grid-template-columns: 1fr; }
}
`;
