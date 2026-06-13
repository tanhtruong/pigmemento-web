import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { loadGsap } from '@/lib/lazy-gsap';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { motionDurations } from '@/lib/motion-tokens';

import { BeatRealCases } from './why-beats/beat-real-cases';
import { BeatBreadth } from './why-beats/beat-breadth';
import { BeatFeedbackCard } from './why-beats/beat-feedback-card';
import { BeatTimeRing } from './why-beats/beat-time-ring';

/**
 * WhyScrubReel — the horizontal-advance answer to "Why Pigmemento."
 *
 * Pins for ~4 viewport heights of vertical scroll. A horizontal strip of four
 * full-bleed beat compositions translates leftward at constant speed, with the
 * GSAP timeline also driving:
 *
 *   • Beat 04 — the hairline ring's amber arc sweeps from 0 to 95% inside its
 *     visible window (scrub 0.80–0.97).
 *
 * Beats 01–03 are static compositions — their visual proof reads fully on
 * arrival.
 *
 * Reduced-motion + mobile branches render the four beats vertically stacked
 * at ~80vh each, with the scrub-dependent elements rendered in their resolved
 * end-state. The mobile branch wraps each beat in a whileInView fade-up so the
 * cinema voice is preserved even without the pin.
 *
 * Section id `why` is the anchor target for ScrollRail's WHY frame.
 */

const RING_CIRCUMFERENCE = 2 * Math.PI * 45;
const RING_FILLED_OFFSET = RING_CIRCUMFERENCE * (1 - 0.95);

export const WhyScrubReel = () => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (shouldReduceMotion || isMobile) {
    return <WhyStaticStack mobile={isMobile && !shouldReduceMotion} />;
  }

  return <WhyAnimatedReel />;
};

/* ──────────────────────────────────────────────────────────────────────── */

const WhyAnimatedReel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killed = false;
    let trigger: { kill: () => void } | null = null;

    loadGsap().then(({ gsap }) => {
      if (
        killed ||
        !sectionRef.current ||
        !stageRef.current ||
        !stripRef.current
      ) {
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: stageRef.current,
            start: 'top top',
            end: '+=400%',
            scrub: 0.4,
          },
        });

        // Horizontal strip translate — linear so each beat takes 1/4 of scrub.
        // Strip is 400vw wide; translating xPercent -75 puts beat 04 at left.
        tl.to(
          stripRef.current,
          {
            xPercent: -75,
            ease: 'none',
            duration: 1,
          },
          0,
        );

        // Beat 04 — timer arc sweeps from full dasharray to ~95% filled.
        const arc =
          stripRef.current?.querySelector<SVGCircleElement>('[data-time-arc]');
        if (arc) {
          tl.fromTo(
            arc,
            { strokeDashoffset: RING_CIRCUMFERENCE },
            {
              strokeDashoffset: RING_FILLED_OFFSET,
              ease: 'power1.inOut',
              duration: 0.17,
            },
            0.8,
          );
        }

        trigger = tl.scrollTrigger ?? null;
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => {
      killed = true;
      trigger?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why"
      data-slot="why-scrub-reel"
      className="relative isolate w-full"
      aria-label="Why Pigmemento"
    >
      <div ref={stageRef} className="relative h-screen overflow-hidden">
        {/* Section eyebrow — anchored below the ScrollRail (h-11 = 44px) so it
            clears the rail at every scroll position inside this pin. The rail
            is always visible while the Why pin is engaged. */}
        <div className="pointer-events-none absolute left-6 top-16 z-10 flex flex-col gap-1 md:left-10 md:top-[4.5rem]">
          <p className="text-primary font-mono text-[0.65rem] tracking-[0.22em] uppercase">
            Why Pigmemento
          </p>
          <p className="text-muted-foreground/70 font-mono text-[0.6rem] tracking-[0.22em] uppercase">
            Four beats · scroll to advance
          </p>
        </div>

        {/* Horizontal advancing strip — width is 4 viewports */}
        <div
          ref={stripRef}
          className="flex h-full will-change-transform"
          style={{ width: '400vw' }}
        >
          <BeatRealCases />
          <BeatBreadth />
          <BeatFeedbackCard />
          <BeatTimeRing />
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────────────── */

type WhyStaticStackProps = {
  /** When true, wrap each beat in a whileInView fade-up. */
  mobile?: boolean;
};

const WhyStaticStack = ({ mobile = false }: WhyStaticStackProps) => {
  return (
    <section
      id="why"
      data-slot="why-scrub-reel"
      data-static
      className="relative isolate w-full"
      aria-label="Why Pigmemento"
    >
      <div className="mx-auto w-full max-w-6xl flex-col gap-6 px-6 pt-16 pb-4 md:pt-20">
        <p className="text-primary font-mono text-[0.65rem] tracking-[0.22em] uppercase">
          Why Pigmemento
        </p>
        <p className="text-muted-foreground/70 mt-1 font-mono text-[0.6rem] tracking-[0.22em] uppercase">
          Four beats
        </p>
      </div>

      <div className="flex flex-col">
        <StackedBeat mobile={mobile}>
          <BeatRealCases stacked />
        </StackedBeat>
        <StackedBeat mobile={mobile}>
          <BeatBreadth stacked />
        </StackedBeat>
        <StackedBeat mobile={mobile}>
          <BeatFeedbackCard stacked />
        </StackedBeat>
        <StackedBeat mobile={mobile}>
          <BeatTimeRing stacked resolved />
        </StackedBeat>
      </div>
    </section>
  );
};

const StackedBeat = ({
  mobile,
  children,
}: {
  mobile: boolean;
  children: React.ReactNode;
}) => {
  if (!mobile) {
    return <div>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: motionDurations.considered,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};
