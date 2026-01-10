import { useEffect, useMemo, useRef, useState } from 'react';
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

// Assumes you already have these hooks.
// If your hook names/paths differ, tell me and I’ll align them.

type Label = 'benign' | 'malignant' | 'skipped';

type DrillResult = {
  caseId: string;
  chosenLabel: Label;
  timeToAnswerMs: number;
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

  // Setup
  const [targetCount, setTargetCount] = useState(5);
  const [phase, setPhase] = useState<'setup' | 'running' | 'finished'>('setup');

  // Running state
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [choice, setChoice] = useState<Label | null>(null);
  const startedAtRef = useRef<number>(0);

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

  const advance = () => {
    const nextIndex = index + 1;
    if (nextIndex >= safeTarget) {
      finishDrill();
      return;
    }

    setIndex(nextIndex);
    // Get a fresh case next
    queryClient.invalidateQueries({ queryKey: ['random-case'] });
    refetch();
  };

  const submitCurrent = () => {
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
        onSuccess: () => {
          setResults((prev) => [
            ...prev,
            {
              caseId: String(randomCase.id),
              chosenLabel: choice,
              timeToAnswerMs,
            },
          ]);

          advance();
        },
      },
    );
  };

  const avgTime = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round(
      results.reduce((sum, r) => sum + r.timeToAnswerMs, 0) / results.length,
    );
  }, [results]);

  if (phase === 'setup') {
    return (
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case drill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Do a quick session of back-to-back cases. Educational use only —
              not for diagnosis.
            </p>

            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">
                Number of cases
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
          <CardFooter className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(paths.app.dashboard.getHref())}
            >
              Back
            </Button>
            <Button onClick={startDrill}>Start drill</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Drill complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              You completed{' '}
              <span className="font-medium">{results.length}</span> case
              {results.length === 1 ? '' : 's'}.
            </div>
            <div className="text-sm text-muted-foreground">
              Average time: {avgTime ? formatMs(avgTime) : '—'}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Session log</div>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={`${r.caseId}-${i}`}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>Case {r.caseId}</div>
                      <div className="text-muted-foreground">
                        {formatMs(r.timeToAnswerMs)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Your answer:{' '}
                      {r.chosenLabel === 'skipped' ? 'Skipped' : r.chosenLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Educational use only — not for diagnosis or clinical
              decision-making.
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setPhase('setup');
                setResults([]);
                setIndex(0);
                setChoice(null);
              }}
            >
              New drill
            </Button>
            <Button onClick={() => navigate(paths.app.dashboard.getHref())}>
              Back to dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Running
  return (
    <div className="flex h-[100dvh] flex-col gap-4 overflow-hidden py-6 text-left">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case drill</h1>
          <p className="text-muted-foreground">Progress: {progressLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setPhase('setup');
              setResults([]);
              setIndex(0);
              setChoice(null);
            }}
          >
            Exit
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={randomCase.imageUrl}
                    alt={`Case ${randomCase.id}`}
                    className="w-full object-contain"
                    loading="eager"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Educational use only — not for diagnosis or clinical
                  decision-making.
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-fit">
              <CardHeader>
                <CardTitle>Your answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={choice === 'benign' ? 'default' : 'secondary'}
                    onClick={() => setChoice('benign')}
                    disabled={isSubmitting}
                  >
                    Benign
                  </Button>
                  <Button
                    type="button"
                    variant={choice === 'malignant' ? 'default' : 'secondary'}
                    onClick={() => setChoice('malignant')}
                    disabled={isSubmitting}
                  >
                    Malignant
                  </Button>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={submitCurrent}
                  disabled={!choice || isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>

                {isSubmitError ? (
                  <p className="text-xs text-red-700">
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
                    resetSubmit();

                    advance();
                  }}
                  disabled={isSubmitting}
                >
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
