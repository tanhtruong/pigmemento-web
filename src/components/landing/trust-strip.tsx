import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useMemo } from 'react';

import { Hairline } from '@/components/foundation/hairline.tsx';
import { motionDurations } from '@/lib/motion-tokens.ts';

export type TrustStripItem = {
  /** Geist Mono numeral or short token, rendered larger. */
  value: string;
  /** Geist Sans caption — what the value means. */
  label: string;
  /** Optional external link. Hairline-underlined on hover. */
  href?: string;
};

type TrustStripProps = {
  items: TrustStripItem[];
};

/**
 * The trust strip — single horizontal band that earns credibility silently
 * and gets out of the way. No CTA, no decoration, no card chrome. Hairline
 * top/bottom dividers; 4 items on desktop, 2-col on mobile.
 *
 * Per spec Q9c, the four items are: case count · ISIC source · "Built with
 * dermatologists" · "Educational use only".
 */
export const TrustStrip = ({ items }: TrustStripProps) => {
  const shouldReduceMotion = useReducedMotion();

  const stagger = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.07,
          delayChildren: shouldReduceMotion ? 0 : 0.05,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const fadeUp = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: 8 },
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

  return (
    <section
      data-slot="trust-strip"
      className="relative isolate w-full"
      aria-label="Why you can trust Pigmemento"
    >
      <Hairline />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={stagger}
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4 md:gap-12 md:py-12"
      >
        {items.map((item) => {
          const inner = (
            <>
              <span className="font-display text-foreground text-3xl leading-none tracking-tight md:text-4xl">
                {item.value}
              </span>
              <span className="text-muted-foreground text-sm leading-snug">
                {item.label}
              </span>
            </>
          );
          return (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="flex flex-col gap-2"
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    item.href.startsWith('http')
                      ? 'noreferrer noopener'
                      : undefined
                  }
                  className="hover:text-foreground flex flex-col gap-2 transition-colors"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </motion.div>
          );
        })}
      </motion.div>
      <Hairline />
    </section>
  );
};
