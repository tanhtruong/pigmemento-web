import { cn } from '@/lib/utils';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-16 w-16',
};

const variants = {
  /** Picks up currentColor — sits on amber CTAs, dark hero, anywhere. */
  inherit: 'text-current',
  /** On bone-warm surfaces. */
  ink: 'text-foreground',
  /** Muted — for inline / quiet contexts. */
  muted: 'text-muted-foreground',
  /** Amber — for hero / primary moments. */
  amber: 'text-primary',
};

export type SpinnerProps = {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
  className?: string;
  label?: string;
};

/**
 * Hairline-circle slow-pulse. No CSS spin — that reads "loading bar 2008".
 * Instead: a thin stroke that pulses opacity in a 1.4s loop. Quiet, considered.
 *
 * If you need a true spinner (rare — long async ops), prefer a sonner toast.
 */
export const Spinner = ({
  size = 'md',
  variant = 'muted',
  className = '',
  label = 'Loading',
}: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-[spinner-pulse_1.4s_ease-in-out_infinite]',
        sizes[size],
        variants[variant],
        className,
      )}
      style={{
        // Inline so we don't need to register a keyframe in CSS for a one-off.
        animationName: 'spinner-pulse',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="h-full w-full"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
      <span className="sr-only">{label}</span>
      <style>{`
        @keyframes spinner-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.96); }
          50%      { opacity: 1;    transform: scale(1.0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] { animation: none !important; opacity: 0.65; }
        }
      `}</style>
    </span>
  );
};
