import { useCallback, useEffect, useRef, useState } from 'react';

import type { CaseChoice } from '@/components/cases/case-choice-card';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer.ts';
import {
  interpretAttempt,
  type Verdict,
} from '@/features/cases/lib/interpret-attempt.ts';

export type AttemptPhase = 'question' | 'resolved';

export type UseAttemptOptions = {
  /**
   * Open an already-answered case at its verdict on mount (refresh, history pop,
   * dashboard tap). A fresh flow (random, drill) leaves this off.
   */
  resume?: boolean;
  /**
   * Cosmetic hold between a live answer landing and the verdict resolving — lets
   * a submit-ring close before the surface reveals. The surface owns the value:
   * the single/random flow passes RING_FILL_MS; the drill reveals at once (0).
   */
  revealDelayMs?: number;
};

export type AttemptState = {
  phase: AttemptPhase;
  committed: CaseChoice | null;
  /** The interpreted verdict once resolved; a live answer seeds it, a resume fetches it. */
  verdict: Verdict | null;
  /** Answer time for the resolved attempt, for the surface's timing line. */
  timeToAnswerMs: number | null;
  /** A live answer plays the reveal; a cold-restored verdict composes static. */
  live: boolean;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  /** Commit a choice — gated to one per question phase, ignored while pending. */
  commit: (choice: CaseChoice) => void;
  /** Re-ask this same case (client-only; the prior attempt still stands on the server). */
  retry: () => void;
};

/**
 * useAttempt — the single-case attempt lifecycle (#122).
 *
 * Owns the whole answer → verdict machine: commit gating, answer timing, the
 * submit, the one-shot cold resume, retry, and where the verdict comes from (the
 * submit seeds the latest-attempt cache, so a live answer resolves with no
 * refetch; a resume fetches it). Headless by design — no keyboard, no animation,
 * no auto-advance. Surfaces own all choreography and key bindings; the drill
 * composes a session of these on top.
 */
export const useAttempt = (
  caseId: string,
  { resume = false, revealDelayMs = 0 }: UseAttemptOptions = {},
): AttemptState => {
  const [committed, setCommitted] = useState<CaseChoice | null>(null);
  const [phase, setPhase] = useState<AttemptPhase>('question');
  // A live answer plays the reveal; a cold-restored verdict composes in place.
  const [live, setLive] = useState(false);
  // Bumped on retry so the timer restarts for the re-attempt.
  const [attemptNonce, setAttemptNonce] = useState(0);

  const {
    mutate: submitAttempt,
    isPending,
    isError,
    error,
    reset: resetSubmit,
  } = useCaseSubmitAttempt();

  const { getElapsedMs } = useCaseTimer([caseId, attemptNonce]);

  // The verdict reads from the latest-attempt query (the submit mutation seeds
  // its cache, so a live answer renders with no extra fetch). Only fetched once
  // needed: a resumable case checks on mount; a fresh flow waits for resolve.
  const { data: attempt } = useCaseLatestAttempt(caseId, {
    enabled: resume || phase === 'resolved',
  });

  const resolveTimeoutRef = useRef<number | null>(null);
  const resumedRef = useRef(false);

  const clearResolveTimeout = () => {
    if (resolveTimeoutRef.current !== null) {
      window.clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }
  };

  // Reset the whole machine when the case changes (next case, random reload).
  useEffect(() => {
    clearResolveTimeout();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional full-flow reset when the case changes; also drives external clearResolveTimeout()/resetSubmit(), so it belongs in an effect
    setCommitted(null);
    setPhase('question');
    setLive(false);
    resumedRef.current = false;
    resetSubmit();
  }, [caseId, resetSubmit]);

  useEffect(() => clearResolveTimeout, []);

  // One-shot cold resume: an already-answered case opens at its verdict, with no
  // live reveal. Runs once per case mount, never after a retry (resumedRef stays
  // set), so the user's return to the question sticks.
  useEffect(() => {
    if (!resume || resumedRef.current) return;
    if (phase !== 'question' || committed || !attempt) return;
    resumedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot cold resume: opens an already-answered case at its verdict, gated by resumedRef so it runs once per mount
    setLive(false);
    setPhase('resolved');
  }, [resume, attempt, committed, phase]);

  const commit = useCallback(
    (choice: CaseChoice) => {
      if (phase !== 'question' || committed || isPending) return;
      resetSubmit();
      setCommitted(choice);
      const timeToAnswerMs = getElapsedMs();

      submitAttempt(
        { caseId, attempt: { chosenLabel: choice, timeToAnswerMs } },
        {
          // Let the reveal hold close, then resolve in place. The mutation
          // already seeded the latest-attempt cache, so the verdict has its data
          // the moment the surface reveals.
          onSuccess: () => {
            clearResolveTimeout();
            resolveTimeoutRef.current = window.setTimeout(() => {
              setLive(true);
              setPhase('resolved');
              resolveTimeoutRef.current = null;
            }, revealDelayMs);
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
      revealDelayMs,
    ],
  );

  // Retry — client-only. Returns to the question without submitting; the prior
  // attempt still stands on the server until the user re-commits.
  const retry = useCallback(() => {
    clearResolveTimeout();
    resetSubmit();
    setCommitted(null);
    setLive(false);
    setPhase('question');
    setAttemptNonce((n) => n + 1);
  }, [resetSubmit]);

  const verdict =
    phase === 'resolved' && attempt ? interpretAttempt(attempt) : null;
  const timeToAnswerMs =
    phase === 'resolved' && attempt ? attempt.timeToAnswerMs : null;

  return {
    phase,
    committed,
    verdict,
    timeToAnswerMs,
    live,
    isPending,
    isError,
    error,
    commit,
    retry,
  };
};
