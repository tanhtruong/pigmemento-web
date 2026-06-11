import * as React from 'react';

import { cn } from '@/lib/utils';

type CenterpiecePinnedProps = {
  /** Pre-rendered annotated lesion. PR6 swaps this for the scrub-controlled
   *  AnnotatedLesionImage with timeline-driven annotations. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Landing centerpiece — the pinned-scroll case walkthrough.
 *
 * The single cinematic spend on the landing: image 5:4 → full-bleed climax
 * with ABCDE annotations all on-screen → 5:4 with the serif diagnosis reveal
 * and teaching point.
 *
 * PR6 builds the GSAP timeline + scroll trigger. For PR1, this is the layout
 * shell + the static composed-frame fallback (which is also the
 * reduced-motion path).
 */
export const CenterpiecePinned = ({
  children,
  className,
}: CenterpiecePinnedProps) => {
  return (
    <section
      data-slot="centerpiece-pinned"
      className={cn(
        'relative isolate w-full overflow-hidden',
        'min-h-screen py-20 md:py-32',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-5">
        {children}
      </div>
    </section>
  );
};
