import { cn } from '@/utils/cn';

type HairlineProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

/**
 * Semantic hairline divider — 1px, barely-there, never gray-black.
 * Use instead of <Separator /> when you want the considered-editorial register
 * rather than UI-chrome register.
 */
export const Hairline = ({
  orientation = 'horizontal',
  className,
}: HairlineProps) => {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-hairline',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        className,
      )}
    />
  );
};
