import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { motionDurations } from '@/lib/motion-tokens';
import type { FAQ } from '@/types/faq';

type Props = {
  faqs: FAQ[];
};

/**
 * FaqAccordion — the FAQ as a scannable, click-to-expand accordion.
 *
 * Replaces the earlier pinned/scrubbed split-screen, which scroll-jacked the
 * user through every question one beat at a time — hostile to the scan-and-find
 * intent of an FAQ. Here the full question list is visible at once; clicking a
 * row expands its answer in place. One row open at a time keeps it compact; the
 * first opens by default so the section never reads as empty.
 *
 * Single component across all breakpoints — no pin, no GSAP. Reduced motion
 * skips the height/opacity expand and just swaps the panel in.
 *
 * Section id `faq` remains the ScrollRail's anchor target.
 */
export const FaqAccordion = ({ faqs }: Props) => {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);
  const duration = reduce ? 0 : motionDurations.normal;

  return (
    <section
      id="faq"
      data-slot="faq-accordion"
      className="relative isolate w-full"
      aria-label="Frequently asked questions"
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-20 md:py-28">
        <div className="flex items-baseline gap-3">
          <p className="text-primary font-mono text-[0.7rem] tracking-[0.22em] uppercase">
            FAQ
          </p>
          <p className="text-muted-foreground/60 font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase">
            {faqs.length} questions
          </p>
        </div>
        <h2 className="font-display text-foreground mt-3 mb-8 text-4xl leading-[1.05] md:text-5xl">
          Common questions.
        </h2>

        <ul className="border-hairline border-t">
          {faqs.map((faq, i) => {
            const isOpen = faq.id === openId;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;
            return (
              <li key={faq.id} className="border-hairline border-b">
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="group ease-considered flex w-full cursor-pointer items-center py-5 text-left transition-colors"
                  >
                    <span
                      className={cn(
                        'w-10 shrink-0 font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase',
                        isOpen ? 'text-primary' : 'text-muted-foreground/40',
                      )}
                    >
                      Q{String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'flex-1 pr-4 font-sans text-base leading-snug transition-colors duration-200 md:text-lg',
                        isOpen
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground/85',
                      )}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        'size-4 shrink-0 transition-transform duration-200',
                        isOpen
                          ? 'text-primary rotate-180'
                          : 'text-muted-foreground/50',
                      )}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground max-w-2xl pr-4 pb-6 pl-10 text-sm leading-relaxed md:text-base">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
