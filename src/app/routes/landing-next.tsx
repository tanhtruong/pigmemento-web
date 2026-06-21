import { useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ArrowRight } from 'lucide-react';

import { Head } from '@/components/seo/head.tsx';
import { Button } from '@/components/ui/button.tsx';
import { AmberGlow } from '@/components/foundation/amber-glow.tsx';
import { CaseStage } from '@/components/landing/case-stage/case-stage.tsx';
import { LandingHero } from '@/components/landing/landing-hero.tsx';
import { FaqAccordion } from '@/components/landing/faq-accordion.tsx';
import { useAuthEntry } from '@/features/auth/hooks/use-auth-entry.ts';
import { motionDurations } from '@/lib/motion-tokens.ts';
import {
  case001Breakdown,
  faqs,
  features,
  heroCase,
} from '@/lib/landing-seed-data.tsx';

/**
 * `/next` — the static-first rebuild of the landing page (epic #125, slice #3).
 *
 * This is the FLOOR: pure DOM/CSS, fully usable before any WebGL exists — the
 * version crawlers, phones, reduced-motion, and first-paint users see. The 3D
 * canvas (#129) later mounts over the case-stage region of this same layout
 * (one layout, two fidelities), so the structure here is deliberately flat:
 * no GSAP scroll-pinning, no scroll-rail.
 *
 * Narrative spine: playable Case 001 → ABCDE breakdown → Why → FAQ → Case 002.
 *
 * Mounted under PublicLayout (dark theme, grain, footer). Unlisted + noindex;
 * removed at cutover (#133), when `/` adopts this layout.
 */
const LandingNextRoute = () => {
  const shouldReduceMotion = useReducedMotion();
  const primaryCta = useAuthEntry();

  const viewportOnce = useMemo(() => ({ once: true, amount: 0.2 }), []);

  const fadeIn = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : motionDurations.hero,
          ease: [0.2, 0.8, 0.2, 1],
        },
      },
    }),
    [shouldReduceMotion],
  );

  const scrollToId = useCallback(
    (id: string) => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    },
    [shouldReduceMotion],
  );

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    }),
    [],
  );

  const organizationJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pigmemento',
      url: 'https://pigmemento.app',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'contact@pigmemento.app',
        },
      ],
    }),
    [],
  );

  return (
    <>
      {/* Structured data for SEO (mirrors `/`; `/next` stays noindex so the
          duplicate Organization schema never competes for the canonical). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Head
        title="Pigmemento – Melanoma Recognition Training for Clinicians"
        noindex
      />

      {/* SEO intro — sr-only. Crawlers get the framing; the page stays editorial. */}
      <section className="sr-only">
        <h2>What is Pigmemento?</h2>
        <p>
          Pigmemento is an educational melanoma recognition trainer designed for
          clinicians, general practitioners, and dermatology trainees. Practice
          pattern recognition with case-based drills and structured feedback to
          help you spot high-risk features.
        </p>
        <p>
          This product is for medical education only and does not provide
          diagnosis or treatment recommendations.
        </p>
      </section>

      {/* 1. Hero — playable Case 001: judge the lesion, then "See why" ↓ into
          the breakdown of that same case. */}
      <LandingHero
        primaryCta={primaryCta}
        onSeeHowItWorks={() => scrollToId('how')}
        heroCase={heroCase}
      />

      {/* 2. ABCDE breakdown — the expert reading of the case just judged. Flat
          2D (the centerpiece's static floor); the 3D scene mounts over this
          region in #129. */}
      <motion.section
        id="how"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        aria-label="How a Pigmemento case works"
        className="border-hairline relative isolate border-t"
      >
        <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          {/* Case-stage: static lesion image is the floor; a decorative 3D
              "specimen on the stage" mounts over it on capable desktops (#129). */}
          <CaseStage
            imageSrc={heroCase.imageSrc}
            imageAlt={heroCase.imageAlt}
            features={case001Breakdown.features}
            sourceCredit={case001Breakdown.sourceCredit}
          />

          <div className="flex flex-col gap-6 md:pt-2">
            <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
              Case 001 · the lesion you just saw
            </p>
            <h2 className="font-display text-foreground text-3xl leading-tight md:text-4xl">
              Here’s what a trained eye catches.
            </h2>
            <div className="border-hairline mt-2 flex flex-col gap-3 border-t pt-6">
              <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
                Diagnosis
              </p>
              <p className="font-display text-foreground text-5xl leading-[1.05]">
                {case001Breakdown.diagnosis}
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                {case001Breakdown.teaching}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Why Pigmemento — the four value props, flat editorial grid. */}
      <motion.section
        id="why"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        aria-label="Why Pigmemento"
        className="border-hairline relative isolate border-t"
      >
        <AmberGlow
          size="lg"
          variant="soft"
          className="-top-24 right-0 -z-10 opacity-40"
        />
        <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col gap-3">
            <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
              Why Pigmemento
            </p>
            <h2 className="font-display text-foreground max-w-2xl text-3xl leading-tight md:text-4xl">
              Built to turn looking into knowing.
            </h2>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="border-hairline bg-background/40 rounded-card flex flex-col gap-3 border p-8"
              >
                <span className="text-primary [&_svg]:size-6" aria-hidden>
                  {feature.icon}
                </span>
                <h3 className="font-display text-foreground text-xl">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* 4. FAQ — scannable click-to-expand accordion. */}
      <FaqAccordion faqs={faqs} />

      {/* 5. CTA — closes the loop: the reader is now Case 002, the missing
          diagnosis is theirs. */}
      <motion.section
        id="cta"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="border-hairline relative isolate border-t"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-24 md:grid-cols-[1.3fr_1fr] md:gap-20 md:py-32">
          <div className="flex flex-col items-start gap-7">
            <div className="flex items-baseline gap-3">
              <p className="text-primary font-mono text-[0.7rem] tabular-nums tracking-[0.22em] uppercase">
                Case 002
              </p>
              <span className="bg-hairline h-px w-12" aria-hidden />
              <p className="text-muted-foreground/70 font-mono text-[0.65rem] tracking-[0.22em] uppercase">
                Your turn
              </p>
            </div>
            <h2 className="font-display text-foreground text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Ready to spot it?
            </h2>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              Real dermoscopic cases. Real feedback. Ninety seconds at a time.
            </p>
            <Button asChild size="lg">
              <Link
                to={primaryCta.href}
                onClick={primaryCta.onClick}
                onMouseEnter={primaryCta.onMouseEnter}
                onFocus={primaryCta.onFocus}
              >
                Start your first case
                <ArrowRight />
              </Link>
            </Button>
            <p className="text-muted-foreground/60 mt-1 font-mono text-[0.65rem] tracking-[0.22em] uppercase">
              For GPs · For trainees · For OSCE prep · Built with dermatologists
              &amp; GPs
            </p>
          </div>

          <figure className="relative hidden flex-col items-center md:flex">
            <div className="border-hairline rounded-card relative aspect-[4/5] w-full max-w-xs overflow-hidden border">
              <div
                aria-hidden
                className="from-primary/[0.04] absolute inset-0 bg-gradient-to-br to-transparent"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <p className="text-primary font-mono text-[0.65rem] tracking-[0.22em] uppercase">
                  Diagnosis
                </p>
                <span
                  aria-hidden
                  className="font-display text-foreground/40 text-8xl leading-none italic"
                >
                  ?
                </span>
                <p className="text-muted-foreground/60 font-mono text-[0.6rem] tracking-[0.22em] uppercase">
                  Awaiting
                </p>
              </div>
            </div>
            <figcaption className="text-muted-foreground/70 mt-3 font-mono text-[0.65rem] tracking-[0.22em] uppercase">
              Case 002 · You
            </figcaption>
          </figure>
        </div>
      </motion.section>
    </>
  );
};

export default LandingNextRoute;
