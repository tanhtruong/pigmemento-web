import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { faqs, features } from '@/lib/landing-seed-data';
import { paths } from '@/config/paths.ts';
import { Head } from '@/components/seo/head.tsx';
import { motionDurations } from '@/lib/motion-tokens.ts';
import { LandingHero } from '@/components/landing/landing-hero.tsx';
import {
  TrustStrip,
  type TrustStripItem,
} from '@/components/landing/trust-strip.tsx';
import { CenterpiecePinned } from '@/components/signature/centerpiece-pinned.tsx';
import { isTokenValid } from '@/lib/auth.tsx';

const LandingRoute = () => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  const viewportOnce = useMemo(() => ({ once: true, amount: 0.2 }), []);

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
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

  const fadeUp = useMemo(
    () =>
      ({
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : motionDurations.considered,
            ease: [0.2, 0.8, 0.2, 1],
          },
        },
      }) satisfies Variants,
    [shouldReduceMotion],
  );

  const fadeIn = useMemo(
    () =>
      ({
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: shouldReduceMotion ? 0 : motionDurations.hero,
            ease: [0.2, 0.8, 0.2, 1],
          },
        },
      }) satisfies Variants,
    [shouldReduceMotion],
  );

  const stagger = useMemo(
    () =>
      ({
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.08,
            delayChildren: shouldReduceMotion ? 0 : 0.08,
          },
        },
      }) satisfies Variants,
    [shouldReduceMotion],
  );

  // Where "Start a case" routes — auth-state aware. Mirrors PublicHeader logic.
  const primaryHref = isTokenValid()
    ? paths.app.dashboard.getHref()
    : paths.auth.login.getHref();

  const trustStripItems: TrustStripItem[] = useMemo(
    () => [
      {
        value: '2,000+',
        label: 'Curated dermoscopic cases',
      },
      {
        value: 'ISIC',
        label: 'Sourced from the ISIC Archive',
        href: 'https://www.isic-archive.com/',
      },
      {
        value: 'Built with',
        label: 'Dermatologists & GPs in the loop',
      },
      {
        value: 'For learning',
        label: 'Educational use only — not for diagnosis',
      },
    ],
    [],
  );

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    },
    [shouldReduceMotion],
  );

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    const target = state?.scrollTo;
    if (!target) return;

    // Defer until after paint so sections exist
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (target === '__top__') {
          window.scrollTo({
            top: 0,
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
          });
        } else {
          scrollToId(target);
        }

        // Clear the state so refresh/back doesn't re-scroll
        navigate(location.pathname, { replace: true, state: null });
      }, 0);
    });
  }, [
    location.pathname,
    location.state,
    navigate,
    scrollToId,
    shouldReduceMotion,
  ]);

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Head title="Pigmemento – Melanoma Recognition Training for Clinicians" />
      {/* Hero — question hero with editorial-framed lesion. */}
      <LandingHero
        primaryHref={primaryHref}
        onSeeHowItWorks={() => scrollToId('how')}
        imageSrc="/ISIC_0000022.jpg"
        imageAlt="Dermoscopic image of a pigmented skin lesion"
        sourceCredit="ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE"
      />

      {/* Centerpiece — pinned-scroll case walkthrough (PR6). Replaces the
          previous HowItWorksSection per spec section 9. The id="how" anchor
          is preserved on the centerpiece so the hero CTA still works. */}
      <CenterpiecePinned />

      {/* Trust strip — replaces the previous Stats card-grid (PR2). */}
      <TrustStrip items={trustStripItems} />

      {/* SEO intro — moved to sr-only per spec section 9. Crawlers still see it;
          the visible page stays editorial. Visible re-introduction (if any)
          happens in PR10. */}
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

      {/* Features — 4 cards (PR10). */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28"
      >
        <motion.div
          variants={fadeUp}
          className="mb-12 flex flex-col gap-3 md:max-w-2xl"
        >
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            Why Pigmemento
          </p>
          <h2 className="font-display text-foreground text-4xl leading-tight md:text-5xl">
            A study tool that respects your time and your training.
          </h2>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="border-hairline shadow-warm dark:surface-card-dark flex flex-col gap-4 rounded-card border bg-card p-7"
            >
              <span className="text-primary [&_svg]:h-5 [&_svg]:w-5">
                {feature.icon}
              </span>
              <h3 className="font-display text-foreground text-2xl leading-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Who it's for — mantra band (PR10). Replaces the previous 3-card grid. */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="border-hairline border-y"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-14 md:flex-row md:items-baseline md:justify-between md:py-16">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Built for
          </p>
          <p className="font-display text-foreground max-w-3xl text-2xl leading-tight md:text-3xl">
            For GPs. For dermatology trainees.{' '}
            <span className="text-muted-foreground">For OSCE prep.</span>
          </p>
        </div>
      </motion.section>

      {/* FAQ — restyled to editorial accordion (PR10). */}
      <motion.section
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="mx-auto w-full max-w-3xl px-6 py-20 md:py-28"
      >
        <motion.div variants={fadeUp} className="mb-10 flex flex-col gap-3">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            FAQ
          </p>
          <h2 className="font-display text-foreground text-4xl leading-tight md:text-5xl">
            Common questions.
          </h2>
        </motion.div>
        <Accordion type="multiple" className="divide-hairline">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id.toString()}
              value={faq.id.toString()}
              className="border-hairline border-b"
            >
              <AccordionTrigger className="text-foreground text-left font-sans text-base hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>

      {/* CTA band — single full-width amber moment (PR10). */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="border-hairline relative isolate overflow-hidden border-t"
      >
        <div className="from-primary/8 absolute inset-0 -z-10 bg-gradient-to-br to-transparent" />
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            Pattern recognition, case by case
          </p>
          <h2 className="font-display text-foreground text-4xl leading-tight md:text-6xl">
            Ready to spot it?
          </h2>
          <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
            Real dermoscopic cases. Real feedback. 90 seconds at a time.
          </p>
          <Button asChild size="lg">
            <Link to={primaryHref}>
              Start your first case
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </motion.section>
    </>
  );
};

export default LandingRoute;
