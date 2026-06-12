import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { faqs } from '@/lib/landing-seed-data';
import { Head } from '@/components/seo/head.tsx';
import { motionDurations } from '@/lib/motion-tokens.ts';
import { LandingHero } from '@/components/landing/landing-hero.tsx';
import { loadGsap } from '@/lib/lazy-gsap.ts';
import { CenterpiecePinned } from '@/components/signature/centerpiece-pinned.tsx';
import { ScrollRail } from '@/components/landing/scroll-rail.tsx';
import { LandingLoginFab } from '@/components/landing/landing-login-fab.tsx';
import { WhyScrubReel } from '@/components/landing/why-scrub-reel.tsx';
import { FaqPinnedSplit } from '@/components/landing/faq-pinned-split.tsx';
import { useAuthEntry } from '@/features/auth/hooks/use-auth-entry.ts';

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

  // The "Start a case" gesture — auth-state-aware href, enter-auth bloom
  // when signed out, auth-chunk prefetch on hover/focus. Shared by the
  // hero and the CTA band.
  const primaryCta = useAuthEntry();

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    },
    [shouldReduceMotion],
  );

  // Three pinned ScrollTriggers initialize independently (centerpiece → Why
  // → FAQ). During the first ~800ms the layout shifts as each pin spacer
  // wraps its section, and React Router + GSAP can both attempt to "restore"
  // a scroll position against a stale layout. We hold the page at the top
  // through that window, then issue a single ScrollTrigger.refresh so every
  // trigger computes its start against the final document height. After the
  // hold we let the browser take over again.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let raf = 0;

    const pinTop = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    pinTop();
    interval = setInterval(pinTop, 32);

    loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled) return;
      // After 800ms the three pinned components have all created their
      // triggers and the layout is final. Release the scroll hold, refresh,
      // and the user can scroll normally from scroll 0.
      raf = window.setTimeout(() => {
        if (cancelled) return;
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
      }, 800);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      if (raf) clearTimeout(raf);
      history.scrollRestoration = prevRestoration;
    };
  }, []);

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

      {/* Scroll-born film-strip rail — replaces the previous PublicHeader on
          this route. Hidden at the hero, born once the user scrolls past it. */}
      <ScrollRail />

      {/* Persistent re-entry affordance — bottom-right from page-load. */}
      <LandingLoginFab />

      {/* Hero — question hero with editorial-framed lesion. */}
      <LandingHero
        primaryCta={primaryCta}
        onSeeHowItWorks={() => scrollToId('how')}
        imageSrc="/ISIC_0000022.jpg"
        imageAlt="Dermoscopic image of a pigmented skin lesion"
        sourceCredit="ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE"
      />

      {/* Centerpiece — pinned-scroll case walkthrough. The id="how" anchor is
          the ScrollRail's CASE frame target. */}
      <CenterpiecePinned />

      {/* SEO intro — sr-only. Crawlers see the framing; the visible page
          stays editorial. */}
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

      {/* Why Pigmemento — horizontal scrub reel of 4 beats. Carries the
          id="why" anchor for the ScrollRail's WHY frame. */}
      <WhyScrubReel />

      {/* FAQ — pinned split-screen, film-cut transitions. id="faq" target. */}
      <FaqPinnedSplit faqs={faqs} />

      {/* CTA band — closes the page's narrative loop. The hero asked "Could
          you spot it?" and the centerpiece answered it with "Diagnosis:
          Melanoma" in big serif. This band echoes that lockup: a hairline
          frame with a single serif "?" inside, mono-caps "DIAGNOSIS ·
          AWAITING" — the user is now Case 002, and their diagnosis is the
          one missing. Asymmetric editorial layout matches the Why beats and
          the FAQ split-screen; no gradient backdrop. id="cta" is the
          ScrollRail's START frame target. */}
      <motion.section
        id="cta"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="border-hairline relative isolate border-t"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-24 md:grid-cols-[1.3fr_1fr] md:gap-20 md:py-32">
          {/* LEFT — the copy stack, left-aligned */}
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

          {/* RIGHT — the empty-diagnosis lockup. Mirrors the centerpiece's
              "Melanoma" reveal with a vacant slot the reader has to fill. The
              hairline frame uses the same vocabulary as the Why beat 04 ring
              and the ABCDE annotation circles. */}
          <figure className="relative hidden flex-col items-center md:flex">
            <div className="border-hairline relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-card border">
              {/* Faint amber wash so the frame doesn't read as empty */}
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

export default LandingRoute;
