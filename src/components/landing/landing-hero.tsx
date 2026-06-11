import { Link } from 'react-router';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button.tsx';
import { AmberGlow } from '@/components/foundation/amber-glow.tsx';
import { motionDurations } from '@/lib/motion-tokens.ts';

type LandingHeroProps = {
  /** Primary CTA destination. Defaults to wherever "Start a case" should go
   *  given the user's auth state — the landing route resolves and passes it. */
  primaryHref: string;
  /** Click handler for the ghost "See how it works" CTA — scrolls to the
   *  centerpiece (PR6) or, until then, the existing "How it works" section. */
  onSeeHowItWorks: () => void;
  /** 4:5 portrait dermoscopy hero image. */
  imageSrc: string;
  imageAlt: string;
  /** ISIC archive code or equivalent attribution. Geist Mono caps beneath the image. */
  sourceCredit?: string;
};

/**
 * Question hero — the 6-second seduction.
 *
 *   Eyebrow (Geist Mono caps, amber)
 *     MELANOMA RECOGNITION · CASE-BY-CASE TRAINING
 *   Headline (Instrument Serif, ~80-96px desktop)
 *     Could you spot it?
 *   Subhead (Geist Sans)
 *     Real dermoscopic cases, scored answers, and the teaching …
 *   Primary amber CTA + ghost "See how it works"
 *   Right column: 4:5 portrait dermoscopy + ISIC credit
 *
 * The hero asks the question. The centerpiece (PR6) will answer it. The CTA
 * invites the user to become someone who can answer it themselves.
 */
export const LandingHero = ({
  primaryHref,
  onSeeHowItWorks,
  imageSrc,
  imageAlt,
  sourceCredit = 'ISIC ARCHIVE · COURTESY ISIC',
}: LandingHeroProps) => {
  const shouldReduceMotion = useReducedMotion();

  const stagger = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.08,
          delayChildren: shouldReduceMotion ? 0 : 0.1,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const fadeUp = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: 14 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : motionDurations.considered,
          ease: [0.2, 0.8, 0.2, 1],
        },
      },
    }),
    [shouldReduceMotion],
  );

  const fadeImage = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, scale: 1.02 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: shouldReduceMotion ? 0 : motionDurations.hero,
          ease: [0.2, 0.8, 0.2, 1],
        },
      },
    }),
    [shouldReduceMotion],
  );

  return (
    <section
      data-slot="landing-hero"
      className="relative isolate overflow-hidden"
    >
      {/* Amber glow — the cinematic backdrop behind the headline */}
      <AmberGlow
        size="xl"
        variant="full"
        className="-top-32 -left-32 -z-10 opacity-60"
      />
      <AmberGlow
        size="lg"
        variant="soft"
        className="top-1/3 -right-40 -z-10 opacity-50"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.15fr_1fr] md:gap-16 md:py-28 lg:py-32"
      >
        {/* LEFT — copy column */}
        <div className="flex flex-col gap-7">
          <motion.p
            variants={fadeUp}
            className="text-primary font-mono text-xs tracking-[0.2em] uppercase"
          >
            Melanoma recognition · Case-by-case training
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-foreground text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Could you{' '}
            <span className="italic">
              spot
              <span aria-hidden className="text-primary">
                {' '}
                it
              </span>
              ?
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-muted-foreground max-w-xl text-base leading-relaxed md:text-lg"
          >
            Real dermoscopic cases, scored answers, and the teaching that turns{' '}
            <span className="text-foreground">
              &ldquo;looks suspicious&rdquo;
            </span>{' '}
            into{' '}
            <span className="text-foreground">
              &ldquo;I know the pattern.&rdquo;
            </span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg">
              <Link to={primaryHref}>
                Start a case
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={onSeeHowItWorks}>
              See how it works
              <ArrowDown />
            </Button>
          </motion.div>
        </div>

        {/* RIGHT — editorial-framed 4:5 lesion */}
        <motion.figure
          variants={fadeImage}
          className="flex w-full flex-col gap-3"
        >
          <div className="border-hairline shadow-cinematic dark:surface-card-dark relative aspect-[4/5] w-full overflow-hidden rounded-card border bg-muted/30">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            {/* Subtle vignette to focus attention — 6% opacity */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.06)_100%)]"
            />
          </div>
          <figcaption className="text-muted-foreground font-mono text-[0.6875rem] tracking-wider uppercase">
            {sourceCredit}
          </figcaption>
        </motion.figure>
      </motion.div>
    </section>
  );
};
