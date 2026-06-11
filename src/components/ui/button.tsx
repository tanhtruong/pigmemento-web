import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-button transition-all ease-considered duration-150',
    'active:scale-[0.98] motion-reduce:active:scale-100',
    'hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 shrink-0",
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ].join(' '),
  {
    variants: {
      variant: {
        /** Primary — amber filled. The brand action. */
        default:
          'bg-primary text-primary-foreground shadow-warm-sm hover:shadow-amber-glow hover:brightness-[1.02]',
        /** Destructive — dampened coral, not shouty red. */
        destructive:
          'bg-destructive text-destructive-foreground shadow-warm-sm hover:brightness-[1.05]',
        /** Outline — hairline border, transparent fill. */
        outline:
          'border border-hairline bg-transparent text-foreground hover:bg-accent',
        /** Secondary — neutral surface. */
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        /** Ghost — text-only with hover surface. */
        ghost: 'text-foreground hover:bg-accent',
        /** Link — underline-on-hover. */
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm has-[>svg]:px-3',
        sm: 'h-8 px-3 text-sm gap-1.5 has-[>svg]:px-2.5 rounded-input',
        lg: 'h-11 px-7 text-base has-[>svg]:px-5',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
