import { useCallback, useEffect, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import {
  randomCaseQueryOptions,
  useRandomCase,
} from '@/features/cases/api/use-case-random.ts';
import { prefetchWithCap } from '@/lib/route-loaders.ts';
import { CaseAttemptSkeleton } from '@/components/cases/case-attempt-skeleton.tsx';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer';
import { CaseAttemptView } from '@/app/routes/app/cases/case-attempt.tsx';
import { queryKeys } from '@/lib/query-keys.ts';
import { RING_FILL_MS } from '@/lib/motion-tokens';
import type { CaseChoice } from '@/components/cases/case-choice-card';

/**
 * Prefetch a random case before the surface mounts (#60), capped so a slow
 * fetch never blocks navigation — the surface then shows the developing
 * skeleton. Wired by the router's `convert()` via the `clientLoader` export.
 */
export const clientLoader = (queryClient: QueryClient) => () =>
  prefetchWithCap(queryClient.ensureQueryData(randomCaseQueryOptions()));

const RandomCaseScene = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const { data: caseItem, isLoading, isError } = useRandomCase();

  const [committed, setCommitted] = useState<CaseChoice | null>(null);
  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset,
  } = useCaseSubmitAttempt();

  const { getElapsedMs } = useCaseTimer([caseItem?.id]);

  useEffect(() => {
    setCommitted(null);
  }, [caseItem?.id]);

  const onCommit = useCallback(
    (choice: CaseChoice) => {
      if (!caseItem || committed || isPending) return;
      reset();
      setCommitted(choice);
      const timeToAnswerMs = getElapsedMs();

      submitAttempt(
        {
          caseId: caseItem.id,
          attempt: { chosenLabel: choice, timeToAnswerMs },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: queryKeys['random-case'],
            });
            window.setTimeout(() => {
              navigate(paths.app['case-review'].getHref(caseItem.id));
            }, RING_FILL_MS);
          },
        },
      );
    },
    [
      committed,
      isPending,
      caseItem,
      queryClient,
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
      navigate(0);
    },
    onExit: () => navigate(paths.app.cases.getHref()),
  });

  if (isLoading) {
    return <CaseAttemptSkeleton />;
  }

  if (isError || !caseItem) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <h2 className="font-display text-4xl">Couldn’t fetch a case.</h2>
        <p className="text-muted-foreground text-sm">
          The Library might be empty, or you may not have access.
        </p>
        <Button asChild>
          <Link to={paths.app.cases.getHref()}>Back to library</Link>
        </Button>
      </div>
    );
  }

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

export default RandomCaseScene;
