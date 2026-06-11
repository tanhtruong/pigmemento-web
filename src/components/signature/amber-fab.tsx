import * as React from 'react';
import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

type AmberFABProps = React.ComponentProps<'button'> & {
  label?: string;
  /** Override the default plus icon. */
  icon?: React.ReactNode;
};

/**
 * Amber FAB — mobile-only floating action button. Lives bottom-right on
 * Library/Progress when no inline CTA is visible; hidden on Practice.
 *
 * PR3 (app shell) wires placement + scroll-hide logic. For PR1 it's the
 * pure button surface — used as-is in the signature showcase.
 */
export const AmberFAB = ({
  label = 'Start a case',
  icon,
  className,
  ...props
}: AmberFABProps) => {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'group/fab fixed right-5 bottom-[calc(env(safe-area-inset-bottom,0)+5rem)] z-40',
        'inline-flex h-14 w-14 items-center justify-center rounded-full',
        'bg-primary text-primary-foreground shadow-amber-glow',
        'transition-transform ease-considered duration-200',
        'hover:brightness-[1.04] active:scale-95 motion-reduce:active:scale-100',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'md:hidden',
        className,
      )}
      {...props}
    >
      {icon ?? <Plus className="h-6 w-6" aria-hidden />}
    </button>
  );
};
