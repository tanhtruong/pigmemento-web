import { useCallback, useMemo, type ReactNode } from 'react';
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
 * `/next` — the static-first landing (epic #125), redesigned for a bolder
 * cinematic register (#141): the page as a *specimen dossier* shot through a
 * viewfinder. Editorial scale-contrast (oversized Instrument Serif against tiny
 * Geist Mono slate), registration/crop marks, a ghosted case numeral, and the
 * 3D specimen as the centerpiece — all on the established amber-on-graphite
 * brand. Still pure DOM/CSS at the floor; the 3D canvas (CaseStage) mounts over
 * the case-stage on capable desktops.
 *
 * Narrative spine: playable Case 001 → ABCDE breakdown → method → FAQ → Case 002.
 * Mounted under PublicLayout (dark, grain, footer). Unlisted + noindex.
 */

/** Tiny amber registration corners — frames a region like a film/print crop. */
const CropMarks = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
  >
    <span className="border-primary/40 absolute top-0 left-0 size-3 border-t border-l" />
    <span className="border-primary/40 absolute top-0 right-0 size-3 border-t border-r" />
    <span className="border-primary/40 absolute bottom-0 left-0 size-3 border-b border-l" />
    <span className="border-primary/40 absolute right-0 bottom-0 size-3 border-r border-b" />
  </div>
);

/** A clinical slate strip — mono caps metadata, wide-tracked, dossier voice. */
const Slate = ({ children }: { children: ReactNode }) => (
  <div className="text-muted-foreground/70 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.62rem] tracking-[0.28em] uppercase">
    {children}
  </div>
);

const Tick = () => (
  <span aria-hidden className="bg-primary/50 inline-block h-px w-5" />
);

const LandingNextRoute = () => {
  const shouldReduceMotion = useReducedMotion();
  const primaryCta = useAuthEntry();

  const viewportOnce = useMemo(() => ({ once: true, amount: 0.2 }), []);

  const rise = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : motionDurations.hero,
          ease: [0.16, 1, 0.3, 1],
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

      {/* Fixed viewfinder — corner registration marks + a clinical slate. Reads
          as "looking through the scope"; decorative, never intercepts input. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-3 z-30 hidden md:block"
      >
        <span className="border-primary/30 absolute top-0 left-0 size-5 border-t border-l" />
        <span className="border-primary/30 absolute top-0 right-0 size-5 border-t border-r" />
        <span className="border-primary/30 absolute bottom-0 left-0 size-5 border-b border-l" />
        <span className="border-primary/30 absolute right-0 bottom-0 size-5 border-r border-b" />
        <span className="bg-primary/40 absolute top-1/2 left-0 h-4 w-px -translate-y-1/2" />
        <span className="bg-primary/40 absolute top-1/2 right-0 h-4 w-px -translate-y-1/2" />
      </div>

      {/* SEO intro — sr-only. */}
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

      {/* 1. Hero — the case opens. A slate header, the playable Case 001, and a
          ghosted oversized numeral bleeding off the edge. */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={rise}
        className="relative isolate overflow-hidden"
      >
        <span
          aria-hidden
          className="font-display text-foreground/[0.03] pointer-events-none absolute -top-24 -right-10 text-[24rem] leading-none italic select-none md:text-[34rem]"
        >
          001
        </span>
        <div className="mx-auto w-full max-w-6xl px-6 pt-10 md:px-10">
          <Slate>
            <span className="text-primary">Case File 001</span>
            <Tick />
            <span>ISIC Archive</span>
            <Tick />
            <span>Dermoscopy · 20×</span>
            <span className="ml-auto hidden sm:inline">
              Melanoma recognition · Live drill
            </span>
          </Slate>
          <div className="border-hairline mt-4 border-t" />
        </div>
        <LandingHero
          primaryCta={primaryCta}
          onSeeHowItWorks={() => scrollToId('how')}
          heroCase={heroCase}
        />
      </motion.section>

      {/* 2. The breakdown — the cinematic centerpiece. The specimen on its stage,
          crop-framed, with the diagnosis revealed like a title card. */}
      <motion.section
        id="how"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={rise}
        aria-label="How a Pigmemento case works"
        className="border-hairline relative isolate border-t"
      >
        <AmberGlow
          size="lg"
          variant="soft"
          className="-top-20 left-1/3 -z-10 opacity-40"
        />
        <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <Slate>
            <span className="text-primary">Exhibit A</span>
            <Tick />
            <span>The lesion you just judged</span>
            <span className="ml-auto hidden sm:inline">Expert read</span>
          </Slate>

          <div className="mt-10 grid items-start gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
            {/* The stage — crop-framed specimen (3D on capable desktops). */}
            <div className="relative">
              <CropMarks className="-m-3" />
              <CaseStage
                imageSrc={heroCase.imageSrc}
                imageAlt={heroCase.imageAlt}
                features={case001Breakdown.features}
                sourceCredit={case001Breakdown.sourceCredit}
              />
            </div>

            {/* The verdict — a title-card reveal. */}
            <div className="flex flex-col gap-8 md:pt-6">
              <p className="text-foreground/90 font-display text-3xl leading-[1.15] md:text-4xl">
                Here&rsquo;s what a trained eye catches in{' '}
                <span className="text-primary italic">ninety seconds.</span>
              </p>
              <div className="border-hairline border-t pt-8">
                <Slate>
                  <span>Diagnosis</span>
                  <Tick />
                  <span>Confirmed</span>
                </Slate>
                <h2 className="font-display text-foreground mt-3 text-6xl leading-[0.95] tracking-tight md:text-8xl">
                  {case001Breakdown.diagnosis}
                </h2>
                <p className="text-muted-foreground mt-6 max-w-md text-base leading-relaxed">
                  {case001Breakdown.teaching}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Method — editorial numbered findings, not a card grid. */}
      <motion.section
        id="why"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={rise}
        aria-label="Why Pigmemento"
        className="border-hairline relative isolate border-t"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div className="md:sticky md:top-24 md:self-start">
              <Slate>
                <span className="text-primary">The method</span>
              </Slate>
              <h2 className="font-display text-foreground mt-4 text-4xl leading-[1.02] md:text-6xl">
                Looking,
                <br />
                made <span className="text-primary italic">knowing.</span>
              </h2>
              <p className="text-muted-foreground mt-6 max-w-sm text-base leading-relaxed">
                Four deliberate choices that turn pattern-spotting into a
                trainable reflex.
              </p>
            </div>

            <ul className="flex flex-col">
              {features.map((feature, i) => (
                <li
                  key={feature.title}
                  className="border-hairline grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-t py-8 first:border-t-0 first:pt-0 md:gap-x-10"
                >
                  <span className="text-primary/30 font-display text-5xl tabular-nums md:text-6xl">
                    0{i + 1}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-primary [&_svg]:size-5" aria-hidden>
                        {feature.icon}
                      </span>
                      <h3 className="font-display text-foreground text-2xl">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* 4. FAQ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={rise}
        className="border-hairline relative isolate border-t"
      >
        <div className="mx-auto w-full max-w-6xl px-6 pt-20 md:px-10 md:pt-28">
          <Slate>
            <span className="text-primary">Briefing</span>
            <Tick />
            <span>Frequently asked</span>
          </Slate>
        </div>
        <FaqAccordion faqs={faqs} />
      </motion.section>

      {/* 5. Case 002 — the reader is the next case. */}
      <motion.section
        id="cta"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={rise}
        className="border-hairline relative isolate overflow-hidden border-t"
      >
        <AmberGlow
          size="xl"
          variant="full"
          className="-bottom-40 left-1/2 -z-10 -translate-x-1/2 opacity-50"
        />
        <span
          aria-hidden
          className="font-display text-foreground/[0.03] pointer-events-none absolute -bottom-32 -left-10 text-[24rem] leading-none italic select-none md:text-[34rem]"
        >
          002
        </span>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-28 text-center md:px-10 md:py-36">
          <Slate>
            <span className="text-primary">Case 002</span>
            <Tick />
            <span>Diagnosis · Awaiting</span>
            <Tick />
            <span>Subject · You</span>
          </Slate>
          <h2 className="font-display text-foreground max-w-3xl text-6xl leading-[0.98] tracking-tight md:text-8xl">
            Ready to spot it?
          </h2>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Real dermoscopic cases. Real feedback. Ninety seconds at a time.
          </p>
          <Button asChild size="lg" className="mt-2">
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
          <p className="text-muted-foreground/60 font-mono text-[0.62rem] tracking-[0.28em] uppercase">
            For GPs · For trainees · For OSCE prep · Built with dermatologists
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default LandingNextRoute;
