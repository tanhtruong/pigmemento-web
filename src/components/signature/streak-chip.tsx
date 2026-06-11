import { Flame } from 'lucide-react';

import { cn } from '@/lib/utils';

type StreakChipProps = {
  value: number;
  /** Show the flame glyph. */
  withGlyph?: boolean;
  /** Show as if punching up — used immediately after increment. PR9 wires this. */
  punching?: boolean;
  className?: string;
};

/**
 * Streak chip — top-bar utility. Geist Mono number + amber flame glyph.
 * Quiet, never shouty. The dashboard does NOT re-render this as a hero —
 * the streak lives in the chrome only.
 *
 * Animation (punch + amber halo decay) lands in PR9 — for PR1 the static
 * resting state is the contract.
 */
export const StreakChip = ({
  value,
  withGlyph = true,
  punching = false,
  className,
}: StreakChipProps) => {
  return (
    <span
      data-slot="streak-chip"
      data-punching={punching || undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-hairline',
        'px-2.5 py-1 font-mono text-xs tabular-nums text-foreground',
        'transition-shadow ease-considered duration-200',
        punching && 'shadow-amber-glow',
        className,
      )}
      aria-label={`Current streak: ${value} days`}
    >
      {withGlyph && <Flame className="h-3.5 w-3.5 text-primary" aria-hidden />}
      <span>{value}</span>
    </span>
  );
};
