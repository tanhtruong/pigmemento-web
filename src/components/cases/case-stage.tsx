import { type ReactNode } from 'react';

import { Hairline } from '@/components/foundation/hairline';
import { cn } from '@/utils/cn';

type CaseStageProps = {
  /**
   * Mono eyebrow above the title (amber). The attempt's drill overrides it with
   * session progress; otherwise it carries the short case id.
   */
  eyebrow?: ReactNode;
  /** The h1 — the moment's name ("What do you see?" / "Review"). */
  title: ReactNode;
  /** Optional mono sub-line under the title (muted) — e.g. "Answered in 4.2s". */
  meta?: ReactNode;
  /**
   * Reserve the meta line's height even while `meta` is absent (renders an
   * invisible one-line placeholder). The in-scene flow sets this for the
   * question phase so the header doesn't grow — and shove the hero down a
   * line — the moment the verdict resolves and the "Answered in Xs" meta
   * appears. Do not remove without re-checking that question↔verdict parity.
   */
  reserveMeta?: boolean;
  /** Right-aligned header affordance — typically the "← Library" link. */
  headerActions?: ReactNode;
  /**
   * The lesion hero. Kept sticky on desktop so it holds its exact position
   * across the attempt → review hop.
   */
  hero: ReactNode;
  /** The working column — choices on the attempt, the verdict on the review. */
  children: ReactNode;
  className?: string;
};

/**
 * CaseStage — the shared scaffold behind both the attempt and the review (#81).
 *
 * Both surfaces render the lesion at the SAME size and position (a sticky 4:5
 * hero) inside the SAME header → hairline → two-column grid. The only thing
 * that changes between them is the working column on the right, so routing from
 * the attempt to its review reads as the verdict resolving in place rather than
 * a jump to an unrelated page.
 */
export const CaseStage = ({
  eyebrow,
  title,
  meta,
  reserveMeta,
  headerActions,
  hero,
  children,
  className,
}: CaseStageProps) => (
  <div className={cn('flex flex-col gap-8 text-left md:py-2', className)}>
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <p className="text-primary font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          {title}
        </h1>
        {meta ? (
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            {meta}
          </p>
        ) : (
          reserveMeta && (
            <p
              aria-hidden
              className="invisible font-mono text-[0.6875rem] tracking-[0.18em] uppercase"
            >
              &nbsp;
            </p>
          )
        )}
      </div>
      {headerActions}
    </header>

    <Hairline />

    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <div className="lg:sticky lg:top-20 lg:self-start">{hero}</div>
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  </div>
);
