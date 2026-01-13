import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { paths } from '@/config/paths';
import { useRandomCase } from '@/features/cases/api/use-case-random.ts';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { CheckCircle2 } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd.tsx';
import { Progress } from '@/components/ui/progress.tsx';

type Label = 'benign' | 'malignant' | 'skipped';

type DrillResult = {
  caseId: string;
  chosenLabel: Label;
  timeToAnswerMs: number;
  isCorrect?: boolean;
  correctLabel?: Exclude<Label, 'skipped'>;
};

const clampInt = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const formatMs = (ms: number) => {
  const s = Math.round(ms / 100) / 10;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round((s - m * 60) * 10) / 10;
  return `${m}m ${rem}s`;
};

const CaseDrillScene = () => {
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

  // Setup
  const [targetCount, setTargetCount] = useState(5);
  const [phase, setPhase] = useState<'setup' | 'running' | 'finished'>('setup');

  // Running state
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [choice, setChoice] = useState<Label | null>(null);
  const startedAtRef = useRef<number>(0);
  const advanceTimeoutRef = useRef<number | null>(null);

  const [reveal, setReveal] = useState<{
    isCorrect: boolean | null;
    correctLabel?: Exclude<Label, 'skipped'>;
  } | null>(null);

  const {
    data: randomCase,
    isLoading: isCaseLoading,
    isError: isCaseError,
    refetch,
  } = useRandomCase(phase === 'running');

  const {
    mutate: submitAttempt,
    isPending: isSubmitting,
    isError: isSubmitError,
    error: submitError,
    reset: resetSubmit,
  } = useCaseSubmitAttempt();

  const safeTarget = useMemo(
    () => clampInt(Number.isFinite(targetCount) ? targetCount : 5, 1, 50),
    [targetCount],
  );

  const progressLabel = useMemo(() => {
    if (phase !== 'running') return '';
    return `${index + 1} / ${safeTarget}`;
  }, [index, phase, safeTarget]);

  // Start timer whenever a new case is shown
  useEffect(() => {
    if (phase !== 'running') return;
    if (!randomCase?.id) return;
    startedAtRef.current = performance.now();
    setChoice(null);
    setReveal(null);
    resetSubmit();
  }, [phase, randomCase?.id, resetSubmit]);

  const startDrill = async () => {
    setResults([]);
    setIndex(0);
    setPhase('running');
    // Ensure we load the first case
    await refetch();
  };

  const finishDrill = () => {
    setPhase('finished');
    // Invalidate case-related caches so dashboard/history updates
    queryClient.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey;
        if (!Array.isArray(key) || key.length === 0) return false;
        const head = key[0];
        return (
          typeof head === 'string' &&
          (head.includes('case') ||
            head.includes('attempt') ||
            head.includes('history') ||
            head.includes('cases') ||
            head.includes('random'))
        );
      },
    });
  };

  const advance = useCallback(() => {
    setIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= safeTarget) {
        finishDrill();
        return prev;
      }

      queryClient.invalidateQueries({ queryKey: ['random-case'] });
      refetch();

      return nextIndex;
    });
  }, [finishDrill, queryClient, refetch, safeTarget]);

  const submitCurrent = useCallback(() => {
    if (!randomCase?.id || !choice) return;

    const timeToAnswerMs = Math.max(
      0,
      Math.round(performance.now() - startedAtRef.current),
    );

    resetSubmit();

    // Your mutation currently expects { caseId, attempt: { chosenLabel, timeToAnswerMs } }
    submitAttempt(
      {
        caseId: String(randomCase.id),
        attempt: { chosenLabel: choice, timeToAnswerMs },
      },
      {
        onSuccess: (res) => {
          const isCorrect =
            typeof res?.correct === 'boolean' ? res.correct : null;

          const correctLabel =
            res?.correctLabel === 'benign' || res?.correctLabel === 'malignant'
              ? res.correctLabel
              : undefined;

          setResults((prev) => [
            ...prev,
            {
              caseId: String(randomCase.id),
              chosenLabel: choice,
              timeToAnswerMs,
              isCorrect: isCorrect === null ? undefined : isCorrect,
              correctLabel,
            },
          ]);

          setReveal({ isCorrect, correctLabel });

          if (advanceTimeoutRef.current !== null) {
            window.clearTimeout(advanceTimeoutRef.current);
          }

          advanceTimeoutRef.current = window.setTimeout(() => {
            setReveal(null);
            advance();
            advanceTimeoutRef.current = null;
          }, 650);
        },
      },
    );
  }, [advance, choice, randomCase?.id, resetSubmit, submitAttempt]);

  useEffect(() => {
    if (isCoarsePointer) return;
    if (phase !== 'running') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        (el as any)?.isContentEditable
      )
        return;

      if (isSubmitting || Boolean(reveal)) return;

      if (e.key === 'b') {
        e.preventDefault();
        setChoice('benign');
        return;
      }

      if (e.key === 'm') {
        e.preventDefault();
        setChoice('malignant');
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!randomCase?.id) return;

        setResults((prev) => [
          ...prev,
          {
            caseId: String(randomCase.id),
            chosenLabel: 'skipped',
            timeToAnswerMs: Math.max(
              0,
              Math.round(performance.now() - startedAtRef.current),
            ),
          },
        ]);

        setChoice(null);
        setReveal(null);
        resetSubmit();
        advance();
        return;
      }

      if (e.key === 'Enter') {
        if (!choice) return;
        e.preventDefault();
        submitCurrent();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        const ok = window.confirm(
          'Exit the drill? Your current session will be lost.',
        );
        if (!ok) return;

        setPhase('setup');
        setResults([]);
        setIndex(0);
        setChoice(null);
        setReveal(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    advance,
    choice,
    isSubmitting,
    phase,
    randomCase?.id,
    resetSubmit,
    reveal,
    submitCurrent,
    isCoarsePointer,
  ]);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'running' && advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, [phase]);

  const avgTime = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round(
      results.reduce((sum, r) => sum + r.timeToAnswerMs, 0) / results.length,
    );
  }, [results]);

  const gradedCount = useMemo(
    () => results.filter((r) => typeof r.isCorrect === 'boolean').length,
    [results],
  );

  const correctCount = useMemo(
    () => results.filter((r) => r.isCorrect === true).length,
    [results],
  );

  const skippedCount = useMemo(
    () => results.filter((r) => r.chosenLabel === 'skipped').length,
    [results],
  );

  const incorrectCases = useMemo(
    () => results.filter((r) => r.isCorrect === false),
    [results],
  );

  const sortedResults = useMemo(() => {
    // Show incorrect first, then correct, then skipped/unknown
    const score = (r: DrillResult) =>
      r.chosenLabel === 'skipped'
        ? 2
        : r.isCorrect === false
          ? 0
          : r.isCorrect === true
            ? 1
            : 2;

    return [...results].sort((a, b) => score(a) - score(b));
  }, [results]);

  const accuracy = useMemo(() => {
    if (gradedCount === 0) return null;
    return Math.round((correctCount / gradedCount) * 100);
  }, [correctCount, gradedCount]);

  if (phase === 'setup') {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case drill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">
                Number of cases
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {[5, 10, 20, 50].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={targetCount === n ? 'default' : 'secondary'}
                    onClick={() => setTargetCount(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: 5–10 cases is a great daily drill.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => navigate(paths.app.dashboard.getHref())}
            >
              Back
            </Button>
            <Button className="w-full sm:w-auto" onClick={startDrill}>
              Start drill
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Drill complete</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nice work — keep it consistent for the best training effect.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-medium">
                <CheckCircle2 size={16} />
                Completed
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-3 sm:p-4">
                <div className="text-xs text-muted-foreground">Cases</div>
                <div className="mt-1 text-xl font-semibold sm:text-2xl">
                  {results.length}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Target: {safeTarget}
                </div>
              </div>

              <div className="rounded-lg border p-3 sm:p-4">
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="mt-1 text-xl font-semibold sm:text-2xl">
                  {accuracy !== null ? `${accuracy}%` : '—'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {gradedCount > 0
                    ? `${correctCount}/${gradedCount} graded`
                    : 'Not available'}
                </div>
                <Progress value={accuracy} className="mt-3" />
              </div>

              <div className="rounded-lg border p-3 sm:p-4">
                <div className="text-xs text-muted-foreground">
                  Average time
                </div>
                <div className="mt-1 text-xl font-semibold sm:text-2xl">
                  {avgTime ? formatMs(avgTime) : '—'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Per case
                </div>
              </div>

              <div className="rounded-lg border p-3 sm:p-4">
                <div className="text-xs text-muted-foreground">Skipped</div>
                <div className="mt-1 text-xl font-semibold sm:text-2xl">
                  {skippedCount}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {incorrectCases.length > 0
                    ? `${incorrectCases.length} missed to review`
                    : 'No misses recorded'}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium">Next up</div>
                  <p className="text-xs text-muted-foreground">
                    Reviewing missed cases reinforces learning fastest.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const firstMiss = incorrectCases[0];
                      if (!firstMiss) return;
                      navigate(
                        paths.app['case-review'].getHref(firstMiss.caseId),
                      );
                    }}
                    disabled={incorrectCases.length === 0}
                  >
                    Review missed ({incorrectCases.length})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const last = results[results.length - 1];
                      if (!last) return;
                      navigate(paths.app['case-review'].getHref(last.caseId));
                    }}
                    disabled={results.length === 0}
                  >
                    Review last
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Session log</div>
                <div className="text-xs text-muted-foreground">
                  {results.length} item{results.length === 1 ? '' : 's'}
                </div>
              </div>

              <Separator className="my-3 opacity-60" />

              <div className="space-y-2 md:max-h-[320px] md:overflow-y-auto md:pr-1">
                {sortedResults.map((r, i) => {
                  const label =
                    r.chosenLabel === 'skipped'
                      ? 'Skipped'
                      : r.chosenLabel === 'benign'
                        ? 'Benign'
                        : 'Malignant';

                  const correctnessLabel =
                    r.chosenLabel === 'skipped'
                      ? '—'
                      : typeof r.isCorrect === 'boolean'
                        ? r.isCorrect
                          ? 'Correct'
                          : 'Incorrect'
                        : '—';

                  return (
                    <div
                      key={`${r.caseId}-${i}`}
                      className={`flex flex-col gap-2 rounded-lg border bg-background/60 px-3 py-2 text-sm transition-colors hover:bg-background sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${
                        r.isCorrect === false
                          ? 'border-destructive/20 bg-destructive/5 hover:bg-destructive/10'
                          : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium tabular-nums">
                            Case {r.caseId}
                          </div>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                              r.chosenLabel === 'skipped'
                                ? 'border-border bg-muted/40 text-muted-foreground'
                                : 'border-border bg-background text-foreground'
                            }`}
                          >
                            {label}
                          </span>
                          {correctnessLabel !== '—' ? (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                r.isCorrect === true
                                  ? 'border-primary/20 bg-primary/10 text-primary'
                                  : r.isCorrect === false
                                    ? 'border-destructive/20 bg-destructive/10 text-destructive'
                                    : 'border-border bg-muted/40 text-muted-foreground'
                              }`}
                            >
                              {correctnessLabel}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground/90 break-words">
                          Time: {formatMs(r.timeToAnswerMs)}
                          {r.correctLabel
                            ? ` • Correct: ${r.correctLabel === 'benign' ? 'Benign' : 'Malignant'}`
                            : ''}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className="h-auto px-0 text-xs self-start sm:self-auto"
                        onClick={() =>
                          navigate(paths.app['case-review'].getHref(r.caseId))
                        }
                      >
                        Review
                      </Button>
                    </div>
                  );
                })}
              </div>

              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attempts recorded.
                </p>
              ) : null}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setPhase('setup');
                setResults([]);
                setIndex(0);
                setChoice(null);
              }}
            >
              New drill
            </Button>

            <div className="flex flex-col sm:flex-row w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  // Start the same drill immediately
                  setResults([]);
                  setIndex(0);
                  setChoice(null);
                  setPhase('running');
                  queryClient.invalidateQueries({ queryKey: ['random-case'] });
                  refetch();
                }}
              >
                Run again
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => navigate(paths.app.dashboard.getHref())}
              >
                Back to dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Running
  return (
    <div className="flex min-h-0 flex-col gap-4 bg-background py-4 sm:py-6 text-left text-foreground">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Case drill</h1>
          <div className="space-y-1">
            <p className="text-muted-foreground">Progress: {progressLabel}</p>
            <Progress value={Math.round(((index + 1) / safeTarget) * 100)} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              const ok = window.confirm(
                'Exit the drill? Your current session will be lost.',
              );
              if (!ok) return;

              setPhase('setup');
              setResults([]);
              setIndex(0);
              setChoice(null);
              setReveal(null);
            }}
          >
            <span className="hidden sm:inline-flex">
              <Kbd>ESC</Kbd>
            </span>{' '}
            Exit
          </Button>
        </div>
      </header>
      <div className="flex-1">
        {isCaseLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading case…</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Please wait.
            </CardContent>
          </Card>
        ) : isCaseError || !randomCase ? (
          <Card>
            <CardHeader>
              <CardTitle>Could not load a case</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Please try again.</p>
              <Button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['random-case'] });
                  refetch();
                }}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={randomCase.imageUrl}
                    alt={`Case ${randomCase.id}`}
                    className="w-full object-contain max-h-[60vh] sm:max-h-none"
                    loading="eager"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle>Your answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reveal ? (
                  <div
                    className={
                      reveal.isCorrect === true
                        ? 'rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary'
                        : reveal.isCorrect === false
                          ? 'rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive'
                          : 'rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground'
                    }
                  >
                    {reveal.isCorrect === true ? (
                      <>
                        Correct — {choice === 'benign' ? 'Benign' : 'Malignant'}
                      </>
                    ) : reveal.isCorrect === false && reveal.correctLabel ? (
                      <>
                        Incorrect — Correct:{' '}
                        {reveal.correctLabel === 'benign'
                          ? 'Benign'
                          : 'Malignant'}
                      </>
                    ) : (
                      <>Checked</>
                    )}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant={choice === 'benign' ? 'default' : 'secondary'}
                    onClick={() => setChoice('benign')}
                    disabled={isSubmitting || Boolean(reveal)}
                  >
                    <span className="hidden sm:inline-flex">
                      <Kbd>B</Kbd>
                    </span>{' '}
                    Benign
                  </Button>
                  <Button
                    type="button"
                    variant={choice === 'malignant' ? 'default' : 'secondary'}
                    onClick={() => setChoice('malignant')}
                    disabled={isSubmitting || Boolean(reveal)}
                  >
                    <span className="hidden sm:inline-flex">
                      <Kbd>M</Kbd>
                    </span>{' '}
                    Malignant
                  </Button>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={submitCurrent}
                  disabled={!choice || isSubmitting || Boolean(reveal)}
                >
                  <span className="hidden sm:inline-flex">
                    <Kbd>⏎</Kbd>
                  </span>{' '}
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>

                {isSubmitError ? (
                  <p className="text-xs text-destructive">
                    {submitError instanceof Error
                      ? submitError.message
                      : 'Could not submit attempt. Please try again.'}
                  </p>
                ) : null}

                <Separator />

                <div className="text-xs text-muted-foreground">
                  Completed: {results.length} / {safeTarget}
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (!randomCase?.id) return;

                    setResults((prev) => [
                      ...prev,
                      {
                        caseId: String(randomCase.id),
                        chosenLabel: 'skipped',
                        timeToAnswerMs: Math.max(
                          0,
                          Math.round(performance.now() - startedAtRef.current),
                        ),
                      },
                    ]);

                    setChoice(null);
                    setReveal(null);
                    resetSubmit();

                    advance();
                  }}
                  disabled={isSubmitting || Boolean(reveal)}
                >
                  <span className="hidden sm:inline-flex">
                    <Kbd>S</Kbd>
                  </span>{' '}
                  Skip
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDrillScene;
