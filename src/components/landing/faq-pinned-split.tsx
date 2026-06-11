import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';
import { loadGsap } from '@/lib/lazy-gsap';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { FAQ } from '@/types/faq';

type Props = {
  faqs: FAQ[];
};

/**
 * FaqPinnedSplit — the FAQ section as a pinned split-screen with film-cut
 * transitions between answers.
 *
 * Desktop:
 *   Section pins for ~12 question-beats of vertical scroll. Inside the pinned
 *   viewport, a two-column layout (40/60) renders the full question list on the
 *   left with the active row highlighted, and the active answer panel on the
 *   right. As the user scrolls, the active index advances every 1/12 of the
 *   scrub. The answer panel uses AnimatePresence(mode="wait") so each Q→A swap
 *   is a hard ~80ms film-cut, not a dissolve.
 *
 *   Clicking a question on the left scrubs the pinned section to that
 *   question's window of scroll progress — uses the cached ScrollTrigger
 *   instance to map index → scrollY.
 *
 * Mobile / reduced-motion:
 *   No pin. A sticky header carries the eyebrow + counter; the active index
 *   updates via IntersectionObserver on the rendered Q/A cards. All 12 items
 *   render stacked with whileInView fade-up entrances.
 *
 * Section id `faq` is the ScrollRail's anchor target.
 */
export const FaqPinnedSplit = ({ faqs }: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (shouldReduceMotion || isMobile) {
    return (
      <FaqStaticStack
        faqs={faqs}
        animateMobile={isMobile && !shouldReduceMotion}
      />
    );
  }

  return <FaqAnimatedSplit faqs={faqs} />;
};

/* ──────────────────────────────────────────────────────────────────────── */

type ScrollTriggerLike = {
  kill: () => void;
  start: number;
  end: number;
};

const FaqAnimatedSplit = ({ faqs }: { faqs: FAQ[] }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTriggerLike | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const total = faqs.length;

  useEffect(() => {
    let killed = false;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (killed || !sectionRef.current || !stageRef.current) return;

      const ctx = gsap.context(() => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: stageRef.current,
          start: 'top top',
          // Each question gets ~0.5 viewport of scroll — fast enough that the
          // user feels them film-cutting, slow enough to read the answer.
          end: `+=${total * 50}%`,
          scrub: 0.3,
          onUpdate: (self) => {
            const next = Math.min(total - 1, Math.floor(self.progress * total));
            setActiveIndex((prev) => (prev === next ? prev : next));
          },
        });
        triggerRef.current = trigger as ScrollTriggerLike;
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => {
      killed = true;
      triggerRef.current?.kill();
    };
  }, [total]);

  const handleJumpTo = (index: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    // Land the cursor at the middle of the target question's scrub slice so
    // the user sees that question's answer cleanly (not at the edge of a
    // transition).
    const slice = (trigger.end - trigger.start) / total;
    const target = trigger.start + slice * (index + 0.5);
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  const activeFaq = faqs[activeIndex] ?? faqs[0];

  return (
    <section
      ref={sectionRef}
      id="faq"
      data-slot="faq-pinned-split"
      className="relative isolate w-full"
      aria-label="Frequently asked questions"
    >
      <div
        ref={stageRef}
        className="relative flex h-screen items-center overflow-hidden"
      >
        <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 md:grid-cols-[2fr_3fr] md:gap-16">
          {/* LEFT — full question list with active highlight */}
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <p className="text-primary font-mono text-[0.7rem] tracking-[0.22em] uppercase">
                FAQ
              </p>
              <p className="text-muted-foreground/60 font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase">
                {String(activeIndex + 1).padStart(2, '0')} / {total}
              </p>
            </div>
            <h2 className="font-display text-foreground mb-2 text-3xl leading-[1.05] md:text-4xl">
              Common questions.
            </h2>
            <ul className="border-hairline divide-hairline flex flex-col divide-y border-t border-b">
              {faqs.map((faq, i) => {
                const isActive = i === activeIndex;
                return (
                  <li key={faq.id.toString()}>
                    <button
                      type="button"
                      onClick={() => handleJumpTo(i)}
                      className={cn(
                        'group/q ease-considered flex w-full items-baseline gap-3 py-2.5 text-left font-sans text-sm transition-colors duration-200',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground/60 hover:text-foreground/85',
                      )}
                    >
                      <span
                        className={cn(
                          'shrink-0 font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase',
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      >
                        Q{String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate">{faq.question}</span>
                      {isActive ? (
                        <span
                          aria-hidden
                          className="bg-primary ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="text-muted-foreground/50 mt-1 font-mono text-[0.6rem] tracking-[0.22em] uppercase">
              Scroll to advance · click to jump
            </p>
          </div>

          {/* RIGHT — active answer panel, film-cut between */}
          <div className="relative min-h-[24rem]">
            <AnimatePresence mode="wait">
              <motion.article
                key={activeFaq.id.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.12,
                  ease: 'linear',
                }}
                className="flex flex-col gap-6"
              >
                <p className="text-muted-foreground/70 font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase">
                  Q{String(activeIndex + 1).padStart(2, '0')} ·{' '}
                  {String(activeIndex + 1).padStart(2, '0')} / {total}
                </p>
                <h3 className="font-display text-foreground text-3xl leading-[1.1] md:text-4xl">
                  {activeFaq.question}
                </h3>
                <div className="border-hairline border-t" />
                <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
                  {activeFaq.answer}
                </p>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────────────── */

const FaqStaticStack = ({
  faqs,
  animateMobile,
}: {
  faqs: FAQ[];
  animateMobile: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const total = faqs.length;

  // Track which item is most visible to keep the sticky counter in sync.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.faqIndex ?? '0',
            );
            setActiveIndex(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="faq"
      data-slot="faq-pinned-split"
      data-static
      className="relative isolate w-full"
      aria-label="Frequently asked questions"
    >
      {/* Sticky header carries the counter so users always know where they are */}
      <div className="border-hairline bg-background/85 sticky top-11 z-10 border-b backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-4 px-6 py-3">
          <div className="flex items-baseline gap-3">
            <p className="text-primary font-mono text-[0.7rem] tracking-[0.22em] uppercase">
              FAQ
            </p>
            <p className="font-display text-foreground text-base">
              Common questions.
            </p>
          </div>
          <p className="text-muted-foreground/70 font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase">
            {String(activeIndex + 1).padStart(2, '0')} / {total}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        {faqs.map((faq, i) => {
          const inner = (
            <>
              <div className="flex items-baseline gap-3">
                <span className="text-primary font-mono text-[0.65rem] tabular-nums tracking-[0.22em] uppercase shrink-0">
                  Q{String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-foreground text-xl leading-snug md:text-2xl">
                  {faq.question}
                </h3>
              </div>
              <div className="border-hairline border-t" />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </p>
            </>
          );

          const baseClasses =
            'border-hairline dark:surface-card-dark flex flex-col gap-4 rounded-card border bg-card/60 p-6';

          return animateMobile ? (
            <motion.article
              key={faq.id.toString()}
              ref={(el: HTMLElement | null) => {
                itemRefs.current[i] = el;
              }}
              data-faq-index={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className={baseClasses}
            >
              {inner}
            </motion.article>
          ) : (
            <article
              key={faq.id.toString()}
              ref={(el: HTMLElement | null) => {
                itemRefs.current[i] = el;
              }}
              data-faq-index={i}
              className={baseClasses}
            >
              {inner}
            </article>
          );
        })}
      </div>
    </section>
  );
};
