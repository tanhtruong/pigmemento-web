import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
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

      {/* Who it's for */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto w-full max-w-6xl px-6 py-16"
      >
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Who it’s for</h2>
          <p className="mx-auto mt-2 max-w-2xl text-neutral-600">
            Pigmemento is designed for clinicians and trainees who want to
            improve visual recognition of melanoma.
          </p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>General Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build confidence triaging suspicious lesions and recognizing
                common pitfalls.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dermatology trainees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice pattern recognition with curated cases and expert-style
                feedback.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Students & exam prep</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Prepare for OSCEs and exams using realistic, case-based drills.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
      >
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Why Pigmemento?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-neutral-600">
            Practice with high-quality cases, get actionable feedback, and see
            your skills grow session by session.
          </p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="w-fit p-3 bg-neutral-100 rounded-2xl">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.section>

      {/* How it works — the centerpiece pinned-scroll above replaces this. */}

      {/* Waitlist */}
      {/* <motion.section
        id="waitlist"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto w-full max-w-6xl px-6 py-16"
      >
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-bold">Get early access</h3>
            <CardDescription>
              Join the waitlist to be the first to try Pigmemento and help shape
              the roadmap.
            </CardDescription>
            <div className="mt-3 text-sm text-neutral-600">
              No spam. Unsubscribe anytime.
            </div>
          </CardHeader>
          <CardContent>
            <WaitlistForm />
          </CardContent>
        </Card>
      </motion.section>*/}

      {/* FAQ */}
      <motion.section
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="mx-auto w-full max-w-6xl px-6 pb-20"
      >
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">FAQs</h2>
        <Accordion type="multiple">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id.toString()} value={faq.id.toString()}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>
    </>
  );
};

export default LandingRoute;
