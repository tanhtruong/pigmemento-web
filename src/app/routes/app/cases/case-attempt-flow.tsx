import { type ReactNode, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { Spinner } from '@/components/ui/spinner';
import { CaseVerdict } from '@/components/cases/case-verdict.tsx';
import { CaseAttemptView } from './case-attempt.tsx';
import { useAttempt } from '@/features/cases/hooks/use-attempt.ts';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { shortCaseId } from '@/features/cases/lib/case-id.ts';
import { hasAbcdeFeatures } from '@/features/cases/types/abcde-feature.ts';
import type { CaseDetail } from '@/features/cases/types/case-detail.ts';
import { RING_FILL_MS, easeOut } from '@/lib/motion-tokens';
import { useCoarsePointer } from '@/features/cases/hooks/use-coarse-pointer.ts';
import {
  type Outcome,
  displayLabel,
} from '@/features/cases/lib/interpret-attempt.ts';

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
 * CaseAttemptFlow — the shared single/random attempt flow (#85). Resolves the
 * verdict in place (the lesion hero never moves, the working column swaps),
 * instead of routing to a separate /review page. Re-used by both the keyed
 * attempt route and the random practice route, which differ only in where their
 * next case comes from.
 *
 * The lifecycle lives in `useAttempt` (#122); this surface owns the choreography
 * — the RING_FILL_MS reveal hold, the verdict-phase key grammar, and the
 * in-place column swap.
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

  const {
    phase,
    committed,
    verdict,
    timeToAnswerMs,
    live,
    isPending,
    isError: isSubmitError,
    error: submitError,
    commit,
    retry,
  } = useAttempt(caseId, {
    resume: resumeIfAnswered,
    revealDelayMs: RING_FILL_MS,
  });

  // Question-phase keyboard grammar: B/M/S commit, N next, Esc exit.
  useCaseAttemptShortcuts({
    enabled: phase === 'question' && !isCoarsePointer && !committed,
    isPending,
    onCommit: commit,
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
        retry();
      } else if (k === 'l' || k === 'escape') {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, isCoarsePointer, onNextCase, retry, onExit]);

  const resolved = phase === 'resolved';

  let verdictNode: ReactNode = null;
  let meta: ReactNode;
  let diagnosis: string | undefined;
  if (resolved && verdict) {
    diagnosis = verdict.diagnosis;

    // The question phase reserves this line's height (reserveMeta), so the
    // header holds still as the verdict resolves and the timing settles in — a
    // quiet first beat. A live answer fades it up; a cold-restored verdict and
    // reduced motion compose it static.
    meta = (
      <motion.span
        className="inline-block"
        initial={live && !reducedMotion ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: easeOut, delay: 0.1 }}
      >
        Answered in {formatMs(timeToAnswerMs ?? 0)}
      </motion.span>
    );
    verdictNode = (
      <CaseVerdict
        diagnosis={diagnosis}
        outcome={verdict.outcome}
        outcomeCopy={outcomeCopy(
          verdict.outcome,
          displayLabel(verdict.chosenLabel),
          verdict.diagnosis,
        )}
        teaching={verdict.teaching}
        animate={live && !reducedMotion}
        onNext={onNextCase}
        onRetry={retry}
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
      onCommit={commit}
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
