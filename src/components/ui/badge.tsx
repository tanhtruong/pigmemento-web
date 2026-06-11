import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5',
    'text-xs font-medium whitespace-nowrap w-fit shrink-0 overflow-hidden',
    '[&>svg]:size-3 [&>svg]:pointer-events-none',
    'border border-transparent',
    'transition-[color,background-color,box-shadow] ease-considered duration-150',
    'focus-visible:ring-2 focus-visible:ring-ring/40',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground [a&]:hover:brightness-[1.04]',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-accent',
        /** Outlined badge — hairline border, no fill. The premium-editorial chip. */
        outline:
          'border-hairline bg-transparent text-foreground [a&]:hover:bg-accent',
        /** Dampened mint — correct, never bright "WIN" green. */
        correct: 'bg-correct/15 text-correct border-correct/30',
        /** Dampened coral — incorrect, never alarm red. */
        incorrect: 'bg-incorrect/15 text-incorrect border-incorrect/30',
        /** Alias kept for callers still passing 'destructive'. */
        destructive: 'bg-incorrect/15 text-incorrect border-incorrect/30',
        /** Geist Mono caption chip — case IDs, source credits. */
        mono: 'font-mono text-[0.6875rem] tracking-wider uppercase border-hairline text-muted-foreground bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
