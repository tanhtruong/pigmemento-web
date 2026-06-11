import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CaseChoiceCard,
  type CaseChoice,
} from '@/components/cases/case-choice-card';
import { Hairline } from '@/components/foundation/hairline';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useCase } from '@/features/cases/api/use-case.ts';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { CaseLesionFrame } from '@/components/cases/case-lesion-frame.tsx';
import { RING_FILL_MS } from '@/lib/motion-tokens';

export type Label = CaseChoice;

type CaseAttemptViewProps = {
  caseItem: {
    id: string | number;
    imageUrl: string;
    site: string;
    patientAge: number;
    clinicalNote: string;
  };
  /** The committed choice — drives the ring-fill animation. */
  committed: CaseChoice | null;
  isPending: boolean;
  onCommit: (choice: CaseChoice) => void;
  submitErrorNode?: ReactNode;
  /** "New case" / "Back to library" action(s) for the header. */
  headerActionsNode?: ReactNode;
};

export const CaseAttemptView = ({
  caseItem,
  committed,
  isPending,
  onCommit,
  submitErrorNode,
  headerActionsNode,
}: CaseAttemptViewProps) => {
  const choices: {
    value: CaseChoice;
    label: string;
    shortcut: 'B' | 'M' | 'S';
  }[] = [
    { value: 'benign', label: 'Benign', shortcut: 'B' },
    { value: 'malignant', label: 'Malignant', shortcut: 'M' },
    { value: 'skipped', label: 'Skip', shortcut: 'S' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left md:py-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-primary uppercase">
            Case · {caseItem.id}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight">
            What do you see?
          </h1>
        </div>
        {headerActionsNode}
      </header>

      <Hairline />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* IMAGE — sticky on desktop, hero on mobile */}
        <figure className="lg:sticky lg:top-20 lg:self-start">
          <div className="border-hairline shadow-warm overflow-hidden rounded-card border bg-muted/40">
            <CaseLesionFrame
              imageSrc={caseItem.imageUrl}
              imageAlt={`Case ${caseItem.id}`}
            />
          </div>
        </figure>

        {/* RIGHT — context + choices */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
              Clinical context
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{caseItem.site}</Badge>
              {caseItem.patientAge > 0 && (
                <Badge variant="outline">{caseItem.patientAge}y</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {caseItem.clinicalNote}
            </p>
          </section>

          <Hairline />

          <section className="flex flex-col gap-3">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
              Your call · tap to commit
            </p>
            <div className="flex flex-col gap-2">
              {choices.map((c) => (
                <CaseChoiceCard
                  key={c.value}
                  choice={c.value}
                  label={c.label}
                  shortcut={c.shortcut}
                  selected={committed === c.value}
                  disabled={Boolean(committed) && committed !== c.value}
                  onSelect={() => onCommit(c.value)}
                />
              ))}
            </div>

            {isPending && (
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Spinner size="sm" variant="muted" />
                Saving your attempt…
              </p>
            )}

            {submitErrorNode}
          </section>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

const CaseAttemptScene = () => {
  const queryClient = useQueryClient();
  const { caseId } = useParams();
  const safeCaseId = caseId ?? '';

  const navigate = useNavigate();

  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(Boolean(mq.matches));
    update();
    if ('addEventListener' in mq) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
  }, []);

  const { data: caseItem, isLoading, isError } = useCase(safeCaseId);

  const [committed, setCommitted] = useState<CaseChoice | null>(null);

  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset,
  } = useCaseSubmitAttempt();

  const { getElapsedMs } = useCaseTimer([safeCaseId]);

  useEffect(() => {
    setCommitted(null);
  }, [safeCaseId]);

  const onCommit = useCallback(
    (choice: CaseChoice) => {
      if (!safeCaseId || committed || isPending) return;
      reset();
      setCommitted(choice);
      const timeToAnswerMs = getElapsedMs();

      // Fire submit immediately; let the ring-fill animation play in
      // parallel. Navigate to review after the longer of (ring-fill,
      // submit). RING_FILL_MS is the minimum perceptible delay so the user
      // sees the confirmation animation before the route changes.
      submitAttempt(
        {
          caseId: safeCaseId,
          attempt: { chosenLabel: choice, timeToAnswerMs },
        },
        {
          onSuccess: () => {
            window.setTimeout(() => {
              navigate(paths.app['case-review'].getHref(safeCaseId));
            }, RING_FILL_MS);
          },
        },
      );
    },
    [
      committed,
      isPending,
      safeCaseId,
      reset,
      submitAttempt,
      getElapsedMs,
      navigate,
    ],
  );

  useCaseAttemptShortcuts({
    enabled: Boolean(caseItem) && !isCoarsePointer && !committed,
    isPending,
    onCommit,
    onNewCase: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys['random-case'] });
      navigate(paths.app['case-random'].getHref());
    },
    onExit: () => navigate(paths.app.cases.getHref()),
  });

  if (!safeCaseId) return <CaseMissing />;
  if (isLoading) return <CaseLoading />;
  if (isError || !caseItem) return <CaseMissing />;

  return (
    <CaseAttemptView
      caseItem={caseItem}
      committed={committed}
      isPending={isPending}
      onCommit={onCommit}
      submitErrorNode={
        isSubmitError ? (
          <p className="text-incorrect text-xs">
            {submitError instanceof Error
              ? submitError.message
              : 'Couldn’t save your attempt. Retrying in 3s.'}
          </p>
        ) : null
      }
      headerActionsNode={
        <Button asChild variant="ghost" size="sm">
          <Link to={paths.app.cases.getHref()}>← Library</Link>
        </Button>
      }
    />
  );
};

export default CaseAttemptScene;

/* ────────────────────────────────────────────────────────────────────────── */

const CaseLoading = () => (
  <div className="flex flex-col items-center gap-3 py-20">
    <Spinner size="lg" variant="muted" />
    <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
      Loading case…
    </p>
  </div>
);

const CaseMissing = () => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
    <h2 className="font-display text-4xl">Case not found.</h2>
    <p className="text-muted-foreground text-sm">
      It may have been removed, or you may not have access.
    </p>
    <Button asChild>
      <Link to={paths.app.cases.getHref()}>Back to library</Link>
    </Button>
  </div>
);
