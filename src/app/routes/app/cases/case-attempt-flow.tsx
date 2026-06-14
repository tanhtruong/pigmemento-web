import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { Spinner } from '@/components/ui/spinner';
import { CaseVerdict } from '@/components/cases/case-verdict.tsx';
import type { CaseChoice } from '@/components/cases/case-choice-card';
import { CaseAttemptView } from './case-attempt.tsx';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer.ts';
import { shortCaseId } from '@/features/cases/lib/case-id.ts';
import { hasAbcdeFeatures } from '@/features/cases/types/abcde-feature.ts';
import type { CaseDetail } from '@/features/cases/types/case-detail.ts';
import { RING_FILL_MS, easeOut } from '@/lib/motion-tokens';
import { useCoarsePointer } from '@/features/cases/hooks/use-coarse-pointer.ts';

type Outcome = 'correct' | 'incorrect' | 'skipped';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatMs = (ms: number): string => {
  if (!ms || ms < 0) return '—';
  if (ms < 60_000) {
    const s = Math.round(ms / 100) / 10;
    return `${s}s`;
  }
  const totalS = Math.round(ms / 1000);
  const m = Math.floor(totalS / 60);
  const sec = totalS - m * 60;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
};

const outcomeCopy = (
  outcome: Outcome,
  chosenLabel: string,
  correctLabel: string,
): string => {
  if (outcome === 'correct') return 'You were right.';
  if (outcome === 'skipped') {
    return `You skipped this. The answer is ${correctLabel}.`;
  }
  return `You said ${chosenLabel}. The answer is ${correctLabel}.`;
};

type CaseAttemptFlowProps = {
  caseItem: CaseDetail;
  /** Eyebrow above the title (drill overrides with session progress). */
  eyebrow?: ReactNode;
  /** Header affordance — typically the "← Library" link. */
  headerActionsNode?: ReactNode;
  /**
   * When true, an already-answered case opens at its verdict on mount (refresh,
   * history pop, dashboard tap). The random flow leaves this off — a random
   * case is always answered fresh.
   */
  resumeIfAnswered?: boolean;
  /** Load the next case from the verdict ("Next case" / N / Enter). */
  onNextCase: () => void;
  /** Leave the case for the Library ("← Library" / L / Esc). */
  onExit: () => void;
  submitErrorNode?: ReactNode;
  /** Hero View Transition name (#106) — set to `case-hero` by the id route when
   *  a Library card is morphing in; the random flow leaves it unset. */
  frameViewTransitionName?: string;
};

/**
 * CaseAttemptFlow — the shared single/random attempt flow (#85). Owns the whole
 * answer → verdict lifecycle in one scene: committing resolves the verdict in
 * place (the lesion hero never moves, the working column swaps), instead of
 * routing to a separate /review page. Re-used by both the keyed attempt route
 * and the random practice route, which differ only in where their next case
 * comes from.
 */
export const CaseAttemptFlow = ({
  caseItem,
  eyebrow,
  headerActionsNode,
  resumeIfAnswered = false,
  onNextCase,
  onExit,
  submitErrorNode,
  frameViewTransitionName,
}: CaseAttemptFlowProps) => {
  const caseId = String(caseItem.id);
  const reducedMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();

  const [committed, setCommitted] = useState<CaseChoice | null>(null);
  const [phase, setPhase] = useState<'question' | 'resolved'>('question');
  // A live answer plays the reveal; a cold-restored verdict composes in place.
  const [liveReveal, setLiveReveal] = useState(false);
  // Bumped on "Try again" so the timer restarts for the re-attempt.
  const [attemptNonce, setAttemptNonce] = useState(0);

  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset: resetSubmit,
  } = useCaseSubmitAttempt();

  const { getElapsedMs } = useCaseTimer([caseId, attemptNonce]);

  // The verdict reads from the latest-attempt query (the submit mutation seeds
  // its cache, so a live answer renders the verdict with no extra fetch). Only
  // fetched once we need it: a resumable case checks on mount; the random flow
  // waits until the answer resolves.
  const { data: attempt } = useCaseLatestAttempt(caseId, {
    enabled: resumeIfAnswered || phase === 'resolved',
  });

  const resolveTimeoutRef = useRef<number | null>(null);
  const resumedRef = useRef(false);

  const clearResolveTimeout = () => {
    if (resolveTimeoutRef.current !== null) {
      window.clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }
  };

  // Reset the whole flow when the case changes (next case, random reload).
  useEffect(() => {
    clearResolveTimeout();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional full-flow reset when the case changes; also drives external clearResolveTimeout()/resetSubmit(), so it belongs in an effect
    setCommitted(null);
    setPhase('question');
    setLiveReveal(false);
    resumedRef.current = false;
    resetSubmit();
  }, [caseId, resetSubmit]);

  useEffect(() => clearResolveTimeout, []);

  // One-shot cold resume: an already-answered case opens at its verdict, with
  // no live reveal. Runs once per case mount, and never after a "Try again"
  // (resumedRef stays set), so the user's return to the question sticks.
  useEffect(() => {
    if (!resumeIfAnswered || resumedRef.current) return;
    if (phase !== 'question' || committed || !attempt) return;
    resumedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot cold resume: opens an already-answered case at its verdict, gated by resumedRef so it runs once per mount
    setLiveReveal(false);
    setPhase('resolved');
  }, [resumeIfAnswered, attempt, committed, phase]);

  const onCommit = useCallback(
    (choice: CaseChoice) => {
      if (phase !== 'question' || committed || isPending) return;
      resetSubmit();
      setCommitted(choice);
      const timeToAnswerMs = getElapsedMs();

      submitAttempt(
        { caseId, attempt: { chosenLabel: choice, timeToAnswerMs } },
        {
          // Let the ring-fill close, then resolve the verdict in place. The
          // mutation already seeded the latest-attempt cache, so the verdict
          // has its data the moment the column swaps.
          onSuccess: () => {
            clearResolveTimeout();
            resolveTimeoutRef.current = window.setTimeout(() => {
              setLiveReveal(true);
              setPhase('resolved');
              resolveTimeoutRef.current = null;
            }, RING_FILL_MS);
          },
        },
      );
    },
    [
      phase,
      committed,
      isPending,
      resetSubmit,
      getElapsedMs,
      submitAttempt,
      caseId,
    ],
  );

  // Try again — client-only (#85). Returns to the question without submitting;
  // the prior attempt still stands on the server until the user re-commits.
  const onRetry = useCallback(() => {
    clearResolveTimeout();
    resetSubmit();
    setCommitted(null);
    setLiveReveal(false);
    setPhase('question');
    setAttemptNonce((n) => n + 1);
  }, [resetSubmit]);

  // Question-phase keyboard grammar: B/M/S commit, N next, Esc exit.
  useCaseAttemptShortcuts({
    enabled: phase === 'question' && !isCoarsePointer && !committed,
    isPending,
    onCommit,
    onNewCase: onNextCase,
    onExit,
  });

  // Verdict-phase keyboard grammar: Enter/N next · R retry · L/Esc library.
  useEffect(() => {
    if (phase !== 'resolved' || isCoarsePointer) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        Boolean(el?.isContentEditable)
      ) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'enter' || k === 'n') {
        e.preventDefault();
        onNextCase();
      } else if (k === 'r') {
        e.preventDefault();
        onRetry();
      } else if (k === 'l' || k === 'escape') {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, isCoarsePointer, onNextCase, onRetry, onExit]);

  const resolved = phase === 'resolved';

  let verdictNode: ReactNode = null;
  let meta: ReactNode;
  let diagnosis: string | undefined;
  if (resolved && attempt) {
    const chosen = String(attempt.chosenLabel).toLowerCase();
    const correctLabel = String(attempt.correctLabel).toLowerCase();
    const outcome: Outcome =
      chosen === 'skipped'
        ? 'skipped'
        : attempt.correct
          ? 'correct'
          : 'incorrect';
    diagnosis = titleCase(correctLabel);
    const teaching =
      attempt.teachingPoints?.length > 0
        ? attempt.teachingPoints.join(' ')
        : 'Compare against the ABCDE markers — those are the features that drove the call.';

    // The question phase reserves this line's height (reserveMeta), so the
    // header holds still as the verdict resolves and the timing settles in — a
    // quiet first beat. A live answer fades it up; a cold-restored verdict and
    // reduced motion compose it static.
    meta = (
      <motion.span
        className="inline-block"
        initial={liveReveal && !reducedMotion ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: easeOut, delay: 0.1 }}
      >
        Answered in {formatMs(attempt.timeToAnswerMs)}
      </motion.span>
    );
    verdictNode = (
      <CaseVerdict
        diagnosis={diagnosis}
        outcome={outcome}
        outcomeCopy={outcomeCopy(outcome, titleCase(chosen), diagnosis)}
        teaching={teaching}
        animate={liveReveal && !reducedMotion}
        onNext={onNextCase}
        onRetry={onRetry}
        onLibrary={onExit}
      />
    );
  } else if (resolved) {
    // Resolved but the verdict data is not in cache yet (cold network fetch).
    verdictNode = (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Spinner size="sm" variant="muted" />
        Loading verdict…
      </div>
    );
  }

  const heroFeatures = hasAbcdeFeatures(caseItem) ? caseItem.abcdeFeatures : [];

  return (
    <CaseAttemptView
      caseItem={caseItem}
      committed={committed}
      isPending={isPending}
      onCommit={onCommit}
      frameViewTransitionName={frameViewTransitionName}
      eyebrow={eyebrow}
      title={resolved ? 'Review' : undefined}
      meta={meta}
      reserveMeta
      resolved={resolved}
      verdictNode={verdictNode}
      heroFeatures={heroFeatures}
      heroSourceCredit={
        diagnosis
          ? `CASE ${shortCaseId(caseItem.id)} · ${diagnosis.toUpperCase()}`
          : undefined
      }
      headerActionsNode={headerActionsNode}
      submitErrorNode={
        isSubmitError ? (
          <p className="text-incorrect text-xs">
            {submitError instanceof Error
              ? submitError.message
              : 'Couldn’t save your attempt. Retrying in 3s.'}
          </p>
        ) : (
          submitErrorNode
        )
      }
    />
  );
};
