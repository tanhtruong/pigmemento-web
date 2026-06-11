import * as React from 'react';

import { cn } from '@/lib/utils';

type ProgressJournalProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * Layout shell for the Progress dashboard — the "study journal, not leaderboard".
 *
 * Six blocks (PR9 fills these):
 *   1. Greeting + suggested-next CTAs
 *   2. ONE hero metric (today count + amber sparkline)
 *   3. "Where you're growing / Where you stumble" panels — the signature surface
 *   4. Recent attempts journal (5 rows)
 *   5. Calendar heatmap
 *   6. Footer Geist Mono totals
 *
 * For PR1 this is the layout grid + breakpoints. Block components land in PR9.
 */
export const ProgressJournal = ({
  children,
  className,
}: ProgressJournalProps) => {
  return (
    <section
      data-slot="progress-journal"
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-10 md:gap-14 md:py-16',
        className,
      )}
    >
      {children}
    </section>
  );
};

type ProgressBlockProps = {
  /** Block label in Geist Mono caps — appears top-left of each block. */
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
};

export const ProgressBlock = ({
  eyebrow,
  children,
  className,
}: ProgressBlockProps) => {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {eyebrow && (
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      )}
      {children}
    </div>
  );
};
