import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Flame } from 'lucide-react';

import { cn } from '@/lib/utils';
import { motionTokens, STREAK_GLOW_DECAY_MS } from '@/lib/motion-tokens';

type StreakChipProps = {
  value: number;
  /** Show the flame glyph. */
  withGlyph?: boolean;
  /** External override — if true, ignore the internal increment-detection. */
  punching?: boolean;
  className?: string;
};

/**
 * Streak chip — top-bar utility. Geist Mono number + amber flame glyph.
 *
 * On increment (value > previous value), the chip fires the locked
 * `streakPunch` spring (overshoots intentionally) and pulses the amber halo
 * via `shadow-amber-glow` over `STREAK_GLOW_DECAY_MS` before settling back
 * to its resting state. Decrements and the initial mount are silent.
 *
 * Reduced motion: the halo + scale animation collapse to instant set; the
 * chip just shows the new number.
 */
export const StreakChip = ({
  value,
  withGlyph = true,
  punching: punchingProp,
  className,
}: StreakChipProps) => {
  const reducedMotion = useReducedMotion();
  const [internalPunching, setInternalPunching] = useState(false);
  const prevValueRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    // Only celebrate genuine increments — not the first mount, not decrements,
    // not the same value.
    if (prev === null || value <= prev) return;
    if (reducedMotion) return;
    setInternalPunching(true);
    const t = window.setTimeout(
      () => setInternalPunching(false),
      STREAK_GLOW_DECAY_MS,
    );
    return () => window.clearTimeout(t);
  }, [value, reducedMotion]);

  const punching = punchingProp ?? internalPunching;

  return (
    <motion.span
      data-slot="streak-chip"
      data-punching={punching || undefined}
      animate={punching ? { scale: [1, 1.18, 1] } : { scale: 1 }}
      transition={motionTokens.streakPunch}
      className={cn(
        'border-hairline text-foreground inline-flex items-center gap-1.5 rounded-full border',
        'px-2.5 py-1 font-mono text-xs tabular-nums',
        'transition-shadow ease-considered duration-300',
        punching && 'shadow-amber-glow',
        className,
      )}
      aria-label={`Current streak: ${value} ${value === 1 ? 'day' : 'days'}`}
    >
      {withGlyph && <Flame className="text-primary h-3.5 w-3.5" aria-hidden />}
      <span>{value}</span>
    </motion.span>
  );
};
