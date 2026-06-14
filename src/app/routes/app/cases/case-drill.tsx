import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { useInAppNavigate } from '@/components/layouts/use-in-app-navigate.ts';
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
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress.tsx';
import { CaseAttemptView } from '@/app/routes/app/cases/case-attempt.tsx';
import { CaseAttemptSkeleton } from '@/components/cases/case-attempt-skeleton.tsx';
import {
  type CaseChoice,
  type CaseChoiceOutcome,
} from '@/components/cases/case-choice-card.tsx';
import { developVariants, RING_FILL_MS } from '@/lib/motion-tokens.ts';
import { cn } from '@/lib/utils.ts';

type Label = 'benign' | 'malignant' | 'skipped';

/** How long the inline correctness reveal holds before the drill advances. */
const REVEAL_HOLD_MS = 650;

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
  const inAppNavigate = useInAppNavigate();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();

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

  const scheduleAdvance = useCallback(
    (delayMs: number) => {
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
      advanceTimeoutRef.current = window.setTimeout(() => {
        setReveal(null);
        advance();
        advanceTimeoutRef.current = null;
      }, delayMs);
    },
    [advance],
  );

  /**
   * Direct-commit, like the single/random attempt (#61): tap or key B/M/S
   * commits straight away — no separate Submit step. Benign/malignant submit,
   * reveal correctness inline on the chosen card, then advance. Skip keeps the
   * drill's own semantics — recorded locally, no submit, no grade — and
   * advances once the ring closes.
   */
  const handleCommit = useCallback(
    (committed: CaseChoice) => {
      if (!randomCase?.id || choice || isSubmitting || reveal) return;
      setChoice(committed);

      const timeToAnswerMs = Math.max(
        0,
        Math.round(performance.now() - startedAtRef.current),
      );

      if (committed === 'skipped') {
        setResults((prev) => [
          ...prev,
          {
            caseId: String(randomCase.id),
            chosenLabel: 'skipped',
            timeToAnswerMs,
          },
        ]);
        scheduleAdvance(RING_FILL_MS);
        return;
      }

      resetSubmit();
      submitAttempt(
        {
          caseId: String(randomCase.id),
          attempt: { chosenLabel: committed, timeToAnswerMs },
        },
        {
          onSuccess: (res) => {
            const isCorrect =
              typeof res?.correct === 'boolean' ? res.correct : null;
            const correctLabel =
              res?.correctLabel === 'benign' ||
              res?.correctLabel === 'malignant'
                ? res.correctLabel
                : undefined;

            setResults((prev) => [
              ...prev,
              {
                caseId: String(randomCase.id),
                chosenLabel: committed,
                timeToAnswerMs,
                isCorrect: isCorrect === null ? undefined : isCorrect,
                correctLabel,
              },
            ]);
            setReveal({ isCorrect, correctLabel });
            scheduleAdvance(REVEAL_HOLD_MS);
          },
        },
      );
    },
    [
      choice,
      isSubmitting,
      randomCase?.id,
      resetSubmit,
      reveal,
      scheduleAdvance,
      submitAttempt,
    ],
  );

  const confirmExit = useCallback(() => {
    const ok = window.confirm(
      'Exit the drill? Your current session will be lost.',
    );
    if (!ok) return;
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setPhase('setup');
    setResults([]);
    setIndex(0);
    setChoice(null);
    setReveal(null);
  }, []);

  // Same keyboard grammar as the single/random attempt (#61): B/M/S commit,
  // Escape exits. Gated off once a choice is in flight or the reveal is up.
  useCaseAttemptShortcuts({
    enabled:
      phase === 'running' &&
      Boolean(randomCase) &&
      !isCoarsePointer &&
      !choice &&
      !reveal &&
      !isSubmitting,
    isPending: isSubmitting,
    onCommit: handleCommit,
    onNewCase: () => {},
    onExit: confirmExit,
  });

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
      <div className="mx-auto flex max-w-2xl flex-col gap-8 py-8 sm:py-12">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-primary uppercase">
            Drill
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Start a drill.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Back-to-back cases that train pattern recognition. 5-10 is a great
            daily session.
          </p>
        </header>
        <section className="flex flex-col gap-3">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
            How many cases
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[5, 10, 20, 50].map((n) => (
              <Button
                key={n}
                type="button"
                variant={targetCount === n ? 'default' : 'outline'}
                onClick={() => setTargetCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </section>
        <footer className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" onClick={startDrill} className="sm:w-fit">
            Start drill
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="sm:w-fit"
            onClick={() => inAppNavigate(paths.app.dashboard.getHref())}
          >
            ← Back
          </Button>
        </footer>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-primary uppercase">
                  Session complete
                </p>
                <CardTitle className="font-display text-4xl leading-tight">
                  Drill complete.
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Keep it consistent — short sessions compound.
                </p>
              </div>
              <span className="border-hairline text-muted-foreground inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-xs">
                <CheckCircle2 size={14} />
                {results.length} / {safeTarget}
              </span>
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
                      inAppNavigate(
                        paths.app['case-attempt'].getHref(firstMiss.caseId),
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
                      inAppNavigate(
                        paths.app['case-attempt'].getHref(last.caseId),
                      );
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
                          inAppNavigate(
                            paths.app['case-attempt'].getHref(r.caseId),
                          )
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
                onClick={() => inAppNavigate(paths.app.dashboard.getHref())}
              >
                Back to dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Running — the same attempt surface as a single/random case (#61). The only
  // difference is the outcome: commit reveals inline on the chosen card and the
  // drill advances, rather than resolving the full verdict in place.
  const labelOf = (c?: Label) =>
    c === 'benign' ? 'Benign' : c === 'malignant' ? 'Malignant' : 'Skip';

  let choiceOutcomes:
    | Partial<Record<CaseChoice, CaseChoiceOutcome>>
    | undefined;
  if (reveal && choice && choice !== 'skipped' && reveal.isCorrect !== null) {
    const oc: Partial<Record<CaseChoice, CaseChoiceOutcome>> = {};
    oc[choice] = reveal.isCorrect ? 'correct' : 'incorrect';
    if (!reveal.isCorrect && reveal.correctLabel) {
      oc[reveal.correctLabel] = 'reveal-correct';
    }
    choiceOutcomes = oc;
  }

  const revealNode =
    reveal && choice && choice !== 'skipped' ? (
      <p
        className={cn(
          'font-mono text-xs tracking-[0.04em]',
          reveal.isCorrect === true && 'text-correct',
          reveal.isCorrect === false && 'text-incorrect',
          reveal.isCorrect === null && 'text-muted-foreground',
        )}
      >
        {reveal.isCorrect === true
          ? `Correct — ${labelOf(choice)}`
          : reveal.isCorrect === false
            ? reveal.correctLabel
              ? `Incorrect — answer: ${labelOf(reveal.correctLabel)}`
              : 'Incorrect'
            : 'Checked'}
      </p>
    ) : undefined;

  const headerActions = (
    <div className="flex items-center gap-3">
      <Progress
        value={Math.round(((index + 1) / safeTarget) * 100)}
        className="h-1 w-24"
      />
      <Button variant="ghost" size="sm" onClick={confirmExit}>
        ← Exit drill
      </Button>
    </div>
  );

  const caseContent =
    isCaseLoading && !randomCase ? (
      <CaseAttemptSkeleton />
    ) : isCaseError || !randomCase ? (
      <Card>
        <CardHeader>
          <CardTitle>Could not load a case</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">Please try again.</p>
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
      <CaseAttemptView
        caseItem={randomCase}
        committed={choice}
        isPending={isSubmitting}
        onCommit={handleCommit}
        eyebrow={`Drill · ${index + 1} / ${safeTarget}`}
        headerActionsNode={headerActions}
        choiceOutcomes={choiceOutcomes}
        revealNode={revealNode}
        submitErrorNode={
          isSubmitError ? (
            <p className="text-incorrect text-xs">
              {submitError instanceof Error
                ? submitError.message
                : 'Could not submit attempt. Please try again.'}
            </p>
          ) : null
        }
      />
    );

  // Case → case rides the 'advance' Develop locally — the drill is one route,
  // so the route outlet never fires. Reduced motion renders the case directly.
  if (reducedMotion) return caseContent;

  const runningKey = randomCase?.id ?? (isCaseLoading ? 'loading' : 'empty');

  return (
    <AnimatePresence mode="wait" initial={false} custom="advance">
      <motion.div
        key={runningKey}
        custom="advance"
        variants={developVariants}
        initial="latent"
        animate="developed"
        exit="fixed"
        data-drill-advance
      >
        {caseContent}
      </motion.div>
    </AnimatePresence>
  );
};

export default CaseDrillScene;
