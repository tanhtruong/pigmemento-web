import { cn } from '@/utils/cn';

/**
 * Hairline-outlined skeleton with opacity pulse. No shimmer (reads 2018-SaaS).
 * Same dimensions as the real content it replaces.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-input border border-hairline bg-muted/40',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
