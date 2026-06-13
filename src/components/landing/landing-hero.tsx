import { Link } from 'react-router';
import { ArrowRight, ArrowDown } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button.tsx';
import { AmberGlow } from '@/components/foundation/amber-glow.tsx';
import { cn } from '@/lib/utils.ts';
import { motionDurations } from '@/lib/motion-tokens.ts';
import type { Label } from '@/features/cases/types/case-label.ts';
import type { HeroCase } from '@/types/hero-case.ts';
import type { AuthEntryGesture } from '@/features/auth/hooks/use-auth-entry';

type LandingHeroProps = {
  /** Primary CTA gesture — href + bloom click handler + chunk prefetch.
   *  The landing route resolves it once and shares it with the CTA band. */
  primaryCta: AuthEntryGesture;
  /** Click handler for the ghost "See why" CTA — scrolls to the centerpiece,
   *  which breaks down the very case the user just judged here. */
  onSeeHowItWorks: () => void;
  /** The playable Case 001 — image, ground truth, and the one-line teaching. */
  heroCase: HeroCase;
};

/**
 * Question hero — the 6-second seduction, now a playable rep.
 *
 *   Eyebrow (Geist Mono caps, amber)
 *   Headline (Instrument Serif)         Could you spot it?
 *   Subhead (Geist Sans)
 *   YOUR CALL → [ Melanoma ] [ Benign ] ← the user actually answers
 *   Right column: 4:5 portrait dermoscopy + ISIC credit
 *
 * After the tap the action area cross-fades to the verdict: right/wrong, the
 * one-line truth, a single cue, and a "See why ↓" nudge into the centerpiece —
 * which carries the full ABCDE breakdown of this same lesion. The reveal here
 * stays deliberately thin so the centerpiece remains the payoff, not a repeat.
 */
export const LandingHero = ({
  primaryCta,
  onSeeHowItWorks,
  heroCase,
}: LandingHeroProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [answer, setAnswer] = useState<Label | null>(null);
  const answered = answer !== null;
  const isCorrect = answer === heroCase.correctLabel;

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

  // Swap (ask ⇄ verdict) cross-fade. mode="wait" + opacity floor keeps the
  // exiting child from leaking under motion 12 / React 19.
  const swapDuration = shouldReduceMotion ? 0 : motionDurations.normal;

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
        className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_1fr] md:grid-rows-[auto_auto] md:items-start md:gap-x-16 md:gap-y-7 md:py-28 lg:py-32"
      >
        {/* COPY — eyebrow, headline, subhead. Row 1 / col 1 on desktop. */}
        <div className="flex flex-col gap-7 md:col-start-1 md:row-start-1">
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
        </div>

        {/* LESION — row 1 / col 2 on desktop, spanning both rows so it sits
            beside the copy + action. On mobile it falls between the subhead and
            the answer buttons, so the user sees the lesion before judging. */}
        <motion.figure
          variants={fadeImage}
          className="flex w-full flex-col gap-3 md:col-start-2 md:row-start-1 md:row-span-2 md:self-center"
        >
          <div className="border-hairline shadow-cinematic dark:surface-card-dark bg-muted/30 rounded-card relative aspect-[4/5] w-full overflow-hidden border">
            <img
              src={heroCase.imageSrc}
              alt={heroCase.imageAlt}
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
          <figcaption className="text-muted-foreground flex flex-col gap-1 font-mono text-[0.6875rem] tracking-wider uppercase">
            <span>{heroCase.sourceCredit}</span>
            <span className="text-muted-foreground/70">
              Database · 2,000+ cases · ISIC Archive
            </span>
          </figcaption>
        </motion.figure>

        {/* ACTION — the playable rep. Row 2 / col 1 on desktop; last on mobile
            (after the lesion). Cross-fades from the question to the verdict. */}
        <motion.div variants={fadeUp} className="md:col-start-1 md:row-start-2">
          <AnimatePresence mode="wait" initial={false}>
            {!answered ? (
              <motion.div
                key="ask"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
                transition={{
                  duration: swapDuration,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="flex flex-col gap-4"
              >
                <p className="text-muted-foreground/70 font-mono text-[0.7rem] tracking-[0.22em] uppercase">
                  Your call
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAnswer('malignant')}
                  >
                    Melanoma
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAnswer('benign')}
                  >
                    Benign
                  </Button>
                </div>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="text-muted-foreground/70 hover:text-foreground self-start px-0"
                >
                  <Link
                    to={primaryCta.href}
                    onClick={primaryCta.onClick}
                    onMouseEnter={primaryCta.onMouseEnter}
                    onFocus={primaryCta.onFocus}
                  >
                    or skip — start a case
                    <ArrowRight />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="verdict"
                role="status"
                aria-live="polite"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: swapDuration,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="flex flex-col gap-4"
              >
                <p className="text-foreground flex items-center gap-2.5 text-base">
                  <span
                    aria-hidden
                    className={cn(
                      'inline-block h-2 w-2 shrink-0 rounded-full',
                      isCorrect ? 'bg-correct' : 'bg-incorrect',
                    )}
                  />
                  <span>
                    <span className="font-medium">
                      {isCorrect ? 'Correct.' : 'Not quite.'}
                    </span>{' '}
                    {heroCase.truth}
                  </span>
                </p>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                  {heroCase.cue}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg">
                    <Link
                      to={primaryCta.href}
                      onClick={primaryCta.onClick}
                      onMouseEnter={primaryCta.onMouseEnter}
                      onFocus={primaryCta.onFocus}
                    >
                      Start a case
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" onClick={onSeeHowItWorks}>
                    See why
                    <ArrowDown />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
};
