import { motion, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils.ts';
import { motionTokens, RING_FILL_MS } from '@/lib/motion-tokens.ts';

export type CaseChoice = 'benign' | 'malignant' | 'skipped';

/**
 * Post-commit colour state (#61). The drill's inline reveal turns the chosen
 * card `correct`/`incorrect`, and marks the missed answer's card
 * `reveal-correct`. Unset on the single/random flow, which swaps the whole
 * working column to the verdict in place rather than recolouring the cards.
 */
export type CaseChoiceOutcome = 'correct' | 'incorrect' | 'reveal-correct';

type CaseChoiceCardProps = {
  choice: CaseChoice;
  label: string;
  /** Keyboard shortcut — displayed bottom-right in Geist Mono. */
  shortcut: 'B' | 'M' | 'S';
  /** Selected = chosen, ring-fill underway. */
  selected?: boolean;
  /** Disabled — another card is committing. */
  disabled?: boolean;
  /** Inline reveal colour (drill). Overrides the resting/selected border. */
  outcome?: CaseChoiceOutcome;
  onSelect: () => void;
};

/**
 * A choice card in the case-attempt flow.
 *
 * - Resting: 1px hairline border, no fill.
 * - Hover/focus: subtle lift (`y: -2`, spring), amber hairline.
 * - **Tap = commit.** The chosen card spring-lifts; a 1.5px hairline ring
 *   animates clockwise around the card, filling amber. When the ring closes
 *   (~350ms), the parent fires the submit and navigates to review.
 *
 * Skip routes to a non-scored reveal — "Marked for review."
 */
export const CaseChoiceCard = ({
  label,
  shortcut,
  selected = false,
  disabled = false,
  outcome,
  onSelect,
}: CaseChoiceCardProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onSelect()}
      disabled={disabled}
      whileHover={!disabled && !selected ? { y: -2 } : undefined}
      whileTap={!disabled && !selected ? { scale: 0.97, y: -1 } : undefined}
      transition={motionTokens.tapLift}
      aria-pressed={selected}
      data-state={selected ? 'selected' : disabled ? 'disabled' : 'idle'}
      data-outcome={outcome}
      className={cn(
        'group/choice relative isolate flex items-center justify-between gap-4',
        'rounded-card border border-hairline bg-card px-5 py-4 text-left',
        'shadow-warm-sm transition-[border-color,box-shadow] ease-considered duration-200',
        'hover:border-primary/40 hover:shadow-warm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected && 'border-primary shadow-amber-glow',
        // Inline reveal (#61) — overrides the amber selected/idle border.
        outcome === 'correct' && 'border-correct shadow-warm',
        outcome === 'incorrect' && 'border-incorrect shadow-warm',
        outcome === 'reveal-correct' && 'border-correct/60',
        disabled && !selected && !outcome && 'pointer-events-none opacity-40',
      )}
    >
      <span className="font-display text-foreground text-xl">{label}</span>

      <span
        className={cn(
          'border-hairline text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[0.7rem]',
          outcome === 'correct' && 'border-correct/40 text-correct',
          outcome === 'incorrect' && 'border-incorrect/40 text-incorrect',
        )}
      >
        {shortcut}
      </span>

      {/* Hairline ring-fill — animates clockwise around the card on commit */}
      {selected && !reducedMotion && (
        <motion.svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.rect
            x="0.5"
            y="0.5"
            width="99"
            height="99"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: RING_FILL_MS / 1000, ease: 'easeOut' }}
            className="text-primary"
          />
        </motion.svg>
      )}
    </motion.button>
  );
};
