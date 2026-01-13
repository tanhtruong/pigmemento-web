import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { paths } from '@/config/paths';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import { useCase } from '@/features/cases/api/use-case.ts';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';

export const CaseReviewScene = () => {
  const { caseId } = useParams();
  const safeCaseId = caseId ?? '';

  const queryClient = useQueryClient();
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

  const formatLabel = (v: string) => {
    const s = String(v || '').toLowerCase();
    if (s === 'benign') return 'Benign';
    if (s === 'malignant') return 'Malignant';
    if (s === 'skipped') return 'Skipped';
    return v;
  };

  const retryCase = () => {
    // Remove cached data so we don't briefly render a stale "latest attempt"
    // (which can feel like it's one behind) before the refetch completes.
    queryClient.removeQueries({
      queryKey: queryKeys['latest-attempt'](safeCaseId),
    });
    queryClient.removeQueries({
      queryKey: queryKeys.case(safeCaseId),
    });

    // List views can stay as invalidate (no need to hard-clear)
    queryClient.invalidateQueries({
      queryKey: queryKeys.cases,
    });

    navigate(paths.app['case-attempt'].getHref(safeCaseId));
  };

  useEffect(() => {
    if (isCoarsePointer) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        (el as any)?.isContentEditable
      )
        return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        navigate(paths.app['case-random'].getHref());
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        retryCase();
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        navigate(paths.app.cases.getHref());
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, retryCase, isCoarsePointer]);

  if (!safeCaseId) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid case</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Missing case identifier.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.dashboard.getHref()}>Back to dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const {
    data: caseItem,
    isLoading: isCaseLoading,
    isError: isCaseError,
  } = useCase(safeCaseId);
  const {
    data: attempt,
    isLoading: isAttemptLoading,
    isError: isAttemptError,
  } = useCaseLatestAttempt(safeCaseId);

  const skipped = attempt
    ? String(attempt.chosenLabel).toLowerCase() === 'skipped'
    : false;
  const correct = attempt
    ? !skipped && attempt.correctLabel === attempt.chosenLabel
    : false;

  if (isCaseLoading || isAttemptLoading) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading review…</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please wait.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCaseError || isAttemptError || !attempt || !caseItem) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Review not available</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We couldn’t load the review for this case.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.dashboard.getHref()}>Back to dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-4 bg-background py-4 sm:py-6 text-left text-foreground">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Case review</h1>
          <p className="text-sm text-muted-foreground">Case {caseItem.id}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link
              to={paths.app.cases.getHref()}
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline-flex">
                <Kbd>L</Kbd>
              </span>{' '}
              Case Library
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link
              to={paths.app['case-random'].getHref()}
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline-flex">
                <Kbd>N</Kbd>
              </span>{' '}
              Next case
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          {/* Image */}
          <Card className="group lg:col-span-2 border-border bg-card transition-colors hover:bg-muted/40 hover:shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle>Case image</CardTitle>
              <p className="text-xs text-muted-foreground">
                Re-check borders, symmetry, and color variation.
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <img
                  src={caseItem.imageUrl}
                  alt={`Case ${caseItem.id}`}
                  className="w-full object-contain max-h-[60vh] sm:max-h-none transition-transform duration-200 group-hover:scale-[1.01]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <Card className="border-border bg-card transition-colors hover:bg-muted/40 hover:shadow-sm">
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div
                  className={
                    skipped
                      ? 'rounded-lg border border-muted-foreground/20 bg-muted/40 px-3 py-2'
                      : correct
                        ? 'rounded-lg border border-primary/20 bg-primary/10 px-3 py-2'
                        : 'rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2'
                  }
                >
                  <div
                    className={
                      skipped
                        ? 'text-xs font-semibold text-foreground'
                        : correct
                          ? 'text-xs font-semibold text-primary'
                          : 'text-xs font-semibold text-destructive'
                    }
                  >
                    {skipped ? 'Skipped' : correct ? 'Correct' : 'Incorrect'}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {skipped ? (
                      <>
                        You skipped this case. Correct answer is{' '}
                        <span className="font-medium text-foreground">
                          {formatLabel(attempt.correctLabel)}
                        </span>
                        .
                      </>
                    ) : correct ? (
                      <>
                        You answered{' '}
                        <span className="font-medium text-foreground">
                          {formatLabel(attempt.chosenLabel)}
                        </span>
                        .
                      </>
                    ) : (
                      <>
                        You answered{' '}
                        <span className="font-medium text-foreground">
                          {formatLabel(attempt.chosenLabel)}
                        </span>
                        . Correct answer is{' '}
                        <span className="font-medium text-foreground">
                          {formatLabel(attempt.correctLabel)}
                        </span>
                        .
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Your answer</span>
                  <span className="flex items-center gap-2">
                    {!skipped && !correct ? (
                      <XCircle
                        className="h-4 w-4 text-destructive"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Badge variant="secondary" className="rounded-full">
                      {formatLabel(attempt.chosenLabel)}
                    </Badge>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Correct answer</span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    <Badge variant="default" className="rounded-full">
                      {formatLabel(attempt.correctLabel)}
                    </Badge>
                  </span>
                </div>

                <Separator />
                <p className="text-xs text-muted-foreground">
                  Educational use only — not for diagnosis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card transition-colors hover:bg-muted/40 hover:shadow-sm lg:sticky lg:top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Next actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full shadow-sm">
                  <Link
                    to={paths.app['case-random'].getHref()}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="hidden sm:inline-flex">
                      <Kbd>N</Kbd>
                    </span>{' '}
                    Next random case
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={retryCase}
                >
                  <span className="hidden sm:inline-flex">
                    <Kbd>R</Kbd>
                  </span>{' '}
                  Try this case again
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link
                    to={paths.app.cases.getHref()}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="hidden sm:inline-flex">
                      <Kbd>L</Kbd>
                    </span>{' '}
                    Back to Case Library
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseReviewScene;
