import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Hairline } from '@/components/foundation/hairline';
import { AnnotatedLesionImage } from '@/components/signature/annotated-lesion-image';
import { DiagnosisReveal } from '@/components/signature/diagnosis-reveal';
import { LesionFlight } from '@/components/motion/lesion-flight';
import {
  consumeLesionFlight,
  type LesionFlightOrigin,
} from '@/lib/lesion-flight';
import { paths } from '@/config/paths';
import { useCase } from '@/features/cases/api/use-case.ts';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import { shortCaseId } from '@/features/cases/lib/case-id.ts';
import {
  hasAbcdeFeatures,
  type AbcdeFeature,
} from '@/features/cases/types/abcde-feature.ts';
import { queryKeys } from '@/lib/query-keys.ts';

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
  if (outcome === 'correct') {
    return 'You were right.';
  }
  if (outcome === 'skipped') {
    return `You skipped this. The answer is ${correctLabel}.`;
  }
  return `You said ${chosenLabel}. The answer is ${correctLabel}.`;
};

/**
 * The review hero, flight-aware (#62). Mounts only once the review content is
 * ready (the scene early-returns on loading), so consuming the flight origin in
 * the first-render initializer never flashes the hero ahead of the print — the
 * same pattern as CaseAttemptView. No flight origin (the common case: deep
 * link, "Next case", reduced motion) → renders the hero plain.
 */
const ReviewLesionHero = ({
  caseId,
  src,
  alt,
  features,
  sourceCredit,
}: {
  caseId: string;
  src: string;
  alt: string;
  features: AbcdeFeature[];
  sourceCredit: string;
}) => {
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const consumedRef = useRef<LesionFlightOrigin | null | undefined>(undefined);
  if (consumedRef.current === undefined) {
    consumedRef.current = reducedMotion ? null : consumeLesionFlight(caseId);
  }
  const [flight, setFlight] = useState<LesionFlightOrigin | null>(
    consumedRef.current,
  );
  const landFlight = useCallback(() => setFlight(null), []);

  return (
    <>
      <AnnotatedLesionImage
        src={src}
        alt={alt}
        aspect="4:5"
        features={features}
        sourceCredit={sourceCredit}
        showAnnotations
        frameRef={heroRef}
        frameHidden={Boolean(flight)}
      />
      {flight && (
        <LesionFlight
          origin={flight}
          targetRef={heroRef}
          onLanded={landFlight}
        />
      )}
    </>
  );
};

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

  const retryCase = useCallback(() => {
    if (!safeCaseId) return;
    queryClient.removeQueries({
      queryKey: queryKeys['latest-attempt'](safeCaseId),
    });
    queryClient.removeQueries({ queryKey: queryKeys.case(safeCaseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.cases });
    navigate(paths.app['case-attempt'].getHref(safeCaseId));
  }, [navigate, queryClient, safeCaseId]);

  useEffect(() => {
    if (isCoarsePointer) return;

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
        navigate(paths.app['case-random'].getHref());
        return;
      }
      if (k === 'r') {
        e.preventDefault();
        retryCase();
        return;
      }
      if (k === 'l' || k === 'escape') {
        e.preventDefault();
        navigate(paths.app.cases.getHref());
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCoarsePointer, navigate, retryCase]);

  if (!safeCaseId) return <ReviewMissing />;
  if (isCaseLoading || isAttemptLoading) return <ReviewLoading />;
  if (isCaseError || isAttemptError || !attempt || !caseItem) {
    return <ReviewMissing />;
  }

  const chosen = String(attempt.chosenLabel).toLowerCase();
  const correctLabel = String(attempt.correctLabel).toLowerCase();
  const skipped = chosen === 'skipped';
  const outcome: Outcome = skipped
    ? 'skipped'
    : attempt.correct
      ? 'correct'
      : 'incorrect';

  const diagnosis = titleCase(correctLabel);

  const features = hasAbcdeFeatures(caseItem) ? caseItem.abcdeFeatures : [];

  const teachingPoint =
    attempt.teachingPoints?.length > 0
      ? attempt.teachingPoints.join(' ')
      : 'Compare against the ABCDE markers — those are the features that drove the call.';

  return (
    <article className="flex flex-col gap-8 py-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <Link
            to={paths.app.cases.getHref()}
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Library
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight">
            Review
          </h1>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
            Case · {shortCaseId(caseItem.id)} · Answered in{' '}
            {formatMs(attempt.timeToAnswerMs)}
          </p>
        </div>
      </header>

      <Hairline />

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <ReviewLesionHero
          caseId={String(caseItem.id)}
          src={caseItem.imageUrl}
          alt={`Case ${caseItem.id}`}
          features={features}
          sourceCredit={`CASE ${shortCaseId(caseItem.id)} · ${diagnosis.toUpperCase()}`}
        />

        <section className="flex flex-col gap-8">
          <DiagnosisReveal
            diagnosis={diagnosis}
            outcome={outcome}
            outcomeCopy={outcomeCopy(outcome, titleCase(chosen), diagnosis)}
            teaching={teachingPoint}
          />

          <Hairline />

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
              Next steps
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full sm:w-fit">
                <Link to={paths.app['case-random'].getHref()}>
                  Next case
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={retryCase}
                className="w-full sm:w-fit"
              >
                <RotateCcw />
                Try this case again
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-fit">
                <Link to={paths.app.cases.getHref()}>← Back to Library</Link>
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 text-[0.6875rem]">
              Shortcuts: <kbd className="font-mono">Enter</kbd> next ·{' '}
              <kbd className="font-mono">R</kbd> retry ·{' '}
              <kbd className="font-mono">L</kbd> library
            </p>
          </div>

          <p className="text-muted-foreground text-[0.6875rem]">
            Educational use only — not for diagnosis.
          </p>
        </section>
      </div>
    </article>
  );
};

export default CaseReviewScene;

/* ────────────────────────────────────────────────────────────────────────── */

const ReviewLoading = () => (
  <div className="flex flex-col items-center gap-3 py-20">
    <Spinner size="lg" variant="muted" />
    <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
      Loading review…
    </p>
  </div>
);

const ReviewMissing = () => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
    <h2 className="font-display text-4xl">Review not available.</h2>
    <p className="text-muted-foreground text-sm">
      We couldn’t load the review for this case.
    </p>
    <Button asChild>
      <Link to={paths.app.cases.getHref()}>Back to library</Link>
    </Button>
  </div>
);
