import { cn } from '@/utils/cn';

type AmberGlowProps = {
  /** soft = trust-strip / card. full = hero headline backdrop. */
  variant?: 'soft' | 'full';
  /** Glow size — Tailwind size class fragments. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<AmberGlowProps['size']>, string> = {
  sm: 'h-40 w-40',
  md: 'h-72 w-72',
  lg: 'h-[28rem] w-[28rem]',
  xl: 'h-[44rem] w-[44rem]',
};

/**
 * Radial amber glow — the cinematic moment behind hero headlines, beneath the
 * diagnosis reveal, and as the streak-milestone halo. Always pointer-events:none
 * and absolutely-positioned by its parent.
 */
export const AmberGlow = ({
  variant = 'full',
  size = 'lg',
  className,
}: AmberGlowProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl',
        variant === 'full' ? 'glow-amber' : 'glow-amber-soft',
        SIZE_CLASSES[size],
        className,
      )}
    />
  );
};
