import { motion, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';
import { Hairline } from '@/components/foundation/hairline';
import { revealSequence } from '@/lib/motion-tokens';

type Outcome = 'correct' | 'incorrect' | 'skipped';

type DiagnosisRevealProps = {
  /** The clinical diagnosis — the Instrument Serif moment. */
  diagnosis: string;
  /** Plain-English teaching point. Geist Sans, leading-relaxed. */
  teaching?: string;
  /** correct → mint dot · incorrect → coral dot · skipped → graphite dot. */
  outcome?: Outcome;
  /** Plain correctness sentence — never shouty. */
  outcomeCopy?: string;
  /** When false, the component renders nothing (pre-commit state). */
  visible?: boolean;
  className?: string;
};

const DOT_CLASS: Record<Outcome, string> = {
  correct: 'bg-correct',
  incorrect: 'bg-incorrect',
  skipped: 'bg-muted-foreground',
};

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

/**
 * The diagnosis reveal — the single Instrument Serif moment inside the app.
 *
 * On mount it plays the locked reveal sequence (~1.6 s total) per spec § 11:
 *   1. Hairline divider draws left→right (0 ms · 220 ms)
 *   2. `DIAGNOSIS` eyebrow fades up (150 ms)
 *   3. Serif diagnosis character-staggers in (300 ms · 24 ms/char · 8 px rise)
 *   4. Dampened correctness indicator + plain copy (550 ms)
 *   5. Teaching prose fades up (700 ms)
 *
 * Reduced motion: all beats render in their final composed state with no
 * animation.
 */
export const DiagnosisReveal = ({
  diagnosis,
  teaching,
  outcome,
  outcomeCopy,
  visible = true,
  className,
}: DiagnosisRevealProps) => {
  const reducedMotion = useReducedMotion();
  if (!visible) return null;

  const at = (ms: number) => ms / 1000;

  return (
    <section
      data-slot="diagnosis-reveal"
      data-outcome={outcome}
      className={cn('flex flex-col gap-4', className)}
    >
      {/* Beat 1 — hairline divider draws */}
      {reducedMotion ? (
        <Hairline />
      ) : (
        <motion.div
          aria-hidden
          className="bg-hairline h-px w-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: revealSequence.dividerDuration / 1000,
            ease: EASE,
            delay: at(revealSequence.divider),
          }}
        />
      )}

      {/* Beat 2 — eyebrow */}
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: EASE,
          delay: reducedMotion ? 0 : at(revealSequence.eyebrow),
        }}
        className="text-primary font-mono text-xs tracking-[0.18em] uppercase"
      >
        Diagnosis
      </motion.p>

      {/* Beat 3 — serif diagnosis with character stagger */}
      <h2
        aria-label={diagnosis}
        className="font-display text-4xl leading-[1.05] sm:text-5xl"
      >
        {reducedMotion
          ? diagnosis
          : Array.from(diagnosis).map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                aria-hidden
                style={{ display: 'inline-block' }}
                initial={{
                  opacity: 0,
                  y: revealSequence.diagnosisCharRise,
                }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: EASE,
                  delay:
                    at(revealSequence.diagnosis) +
                    (i * revealSequence.diagnosisCharStaggerMs) / 1000,
                }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
      </h2>

      {/* Beat 4 — correctness indicator */}
      {outcome && outcomeCopy && (
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.32,
            ease: EASE,
            delay: reducedMotion ? 0 : at(revealSequence.correctness),
          }}
          className="text-foreground flex items-center gap-2 text-sm"
        >
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              DOT_CLASS[outcome],
            )}
            aria-hidden
          />
          {outcomeCopy}
        </motion.p>
      )}

      {/* Beat 5 — teaching prose */}
      {teaching && (
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.42,
            ease: EASE,
            delay: reducedMotion ? 0 : at(revealSequence.teaching),
          }}
          className="text-muted-foreground text-base leading-relaxed"
        >
          {teaching}
        </motion.p>
      )}
    </section>
  );
};
