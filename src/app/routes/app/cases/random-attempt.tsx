import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { paths } from '@/config/paths';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { useRandomCase } from '@/features/cases/api/use-case-random.ts';
import { Kbd } from '@/components/ui/kbd.tsx';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer';
import { CaseAttemptView } from '@/app/routes/app/cases/case-attempt.tsx';
import { queryKeys } from '@/lib/query-keys.ts';

type Label = 'benign' | 'malignant';

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

  const [choice, setChoice] = useState<Label | null>(null);
  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset,
  } = useCaseSubmitAttempt();

  const { elapsedLabel, getElapsedMs } = useCaseTimer([caseItem?.id]);

  const canSubmit = Boolean(choice) && !isPending;

  const onSubmit = useCallback(() => {
    if (!choice || !caseItem) return;

    // clear any previous mutation error
    reset();

    const timeToAnswerMs = getElapsedMs();

    submitAttempt(
      { caseId: caseItem.id, attempt: { chosenLabel: choice, timeToAnswerMs } },
      {
        onSuccess: () => {
          // Invalidate cached random case so the next one is always fresh
          queryClient.invalidateQueries({ queryKey: queryKeys['random-case'] });
          navigate(paths.app['case-review'].getHref(caseItem.id));
        },
      },
    );
  }, [
    choice,
    caseItem,
    queryClient,
    reset,
    submitAttempt,
    navigate,
    getElapsedMs,
  ]);

  useCaseAttemptShortcuts({
    enabled: Boolean(caseItem) && !isCoarsePointer,
    canSubmit,
    isPending,
    onSelectBenign: () => setChoice('benign'),
    onSelectMalignant: () => setChoice('malignant'),
    onSubmit,
    onNewCase: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys['random-case'] });
      navigate(0);
    },
    onExit: () => navigate(paths.app.cases.getHref()),
  });

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading case…</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please wait.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We couldn’t load this case. It may have been removed or you may not
            have access.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.cases.getHref()}>Back to cases</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Missing case id.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.cases.getHref()}>Back to cases</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <CaseAttemptView
      caseItem={caseItem}
      choice={choice}
      setChoice={setChoice}
      elapsedLabel={elapsedLabel}
      isPending={isPending}
      canSubmit={canSubmit}
      onSubmit={onSubmit}
      submitErrorNode={
        isSubmitError ? (
          <p className="text-xs text-red-700">
            {submitError instanceof Error
              ? submitError.message
              : 'Could not submit attempt. Please try again.'}
          </p>
        ) : null
      }
      newCaseNode={
        <Button asChild variant="outline">
          <Link to={paths.app['case-random'].getHref()}>
            <span className="hidden sm:inline-flex">
              <Kbd>N</Kbd>
            </span>
            New case
          </Link>
        </Button>
      }
    />
  );
};

export default RandomCaseScene;
