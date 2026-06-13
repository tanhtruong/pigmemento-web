import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
} from 'react-router';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useReducedMotion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CaseChoiceCard,
  type CaseChoice,
  type CaseChoiceOutcome,
} from '@/components/cases/case-choice-card';
import { Hairline } from '@/components/foundation/hairline';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { caseQueryOptions, useCase } from '@/features/cases/api/use-case.ts';
import { prefetchWithCap } from '@/lib/route-loaders.ts';
import { CaseAttemptSkeleton } from '@/components/cases/case-attempt-skeleton.tsx';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { CaseStage } from '@/components/cases/case-stage.tsx';
import { AnnotatedLesionImage } from '@/components/signature/annotated-lesion-image.tsx';
import { shortCaseId } from '@/features/cases/lib/case-id.ts';
import { LesionFlight } from '@/components/motion/lesion-flight';
import {
  captureLesionFlight,
  consumeLesionFlight,
  type LesionFlightOrigin,
} from '@/lib/lesion-flight';
import { RING_FILL_MS } from '@/lib/motion-tokens';

export type Label = CaseChoice;

/**
 * Prefetch the case before the attempt surface mounts (#60). Cached cases
 * (the react-query majority) reveal with no spinner; a cold fetch is capped so
 * navigation never blocks indefinitely — the surface then shows the developing
 * skeleton. Wired by the router's `convert()` via the `clientLoader` export.
 */
export const clientLoader =
  (queryClient: QueryClient) =>
  ({ params }: LoaderFunctionArgs) => {
    const caseId = params.caseId;
    if (!caseId) return null;
    return prefetchWithCap(
      queryClient.ensureQueryData(caseQueryOptions(caseId)),
    );
  };

type CaseAttemptViewProps = {
  caseItem: {
    id: string | number;
    imageUrl: string;
    site: string;
    patientAge: number;
    clinicalNote: string;
  };
  /** The committed choice — drives the ring-fill animation. */
  committed: CaseChoice | null;
  isPending: boolean;
  onCommit: (choice: CaseChoice) => void;
  submitErrorNode?: ReactNode;
  /** "New case" / "Back to library" action(s) for the header. */
  headerActionsNode?: ReactNode;
  /**
   * Eyebrow above the title. Defaults to `Case · {id}`; the drill overrides it
   * with session progress (#61).
   */
  eyebrow?: ReactNode;
  /**
   * Per-choice reveal colours (#61). When present, the choices section is in
   * its revealed state: cards show correct/incorrect/reveal-correct and are no
   * longer dimmed. The single/random flow leaves this unset (routes to /review).
   */
  choiceOutcomes?: Partial<Record<CaseChoice, CaseChoiceOutcome>>;
  /** Verdict line shown under the choices during the drill's inline reveal. */
  revealNode?: ReactNode;
  /**
   * This commit navigates to /review (#68) — so capture the hero as a flight
   * origin on commit, letting the review surface fly the same photo in place
   * (it reads as staying put while the verdict assembles). The drill leaves
   * this unset: it reveals inline and never hops to review.
   */
  flightToReview?: boolean;
};

export const CaseAttemptView = ({
  caseItem,
  committed,
  isPending,
  onCommit,
  submitErrorNode,
  headerActionsNode,
  eyebrow,
  choiceOutcomes,
  revealNode,
  flightToReview,
}: CaseAttemptViewProps) => {
  const revealing = Boolean(choiceOutcomes);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  // On a review-bound commit, record the hero as the flight origin before the
  // route swaps (#68). ReviewLesionHero consumes it and flies the same photo
  // into the review hero — the two heroes sit in the same place, so the print
  // reads as staying put while the verdict assembles around it. Reduced motion
  // and the inline-reveal drill never capture.
  const handleCommit = useCallback(
    (choice: CaseChoice) => {
      if (flightToReview && !reducedMotion && heroRef.current) {
        captureLesionFlight(
          heroRef.current,
          String(caseItem.id),
          caseItem.imageUrl,
        );
      }
      onCommit(choice);
    },
    [flightToReview, reducedMotion, caseItem.id, caseItem.imageUrl, onCommit],
  );

  // Consume the flight origin exactly once per mount, during the first
  // render — before first paint, so a click-originated entry never flashes
  // the hero ahead of the flight. Non-click entries (deep link, refresh,
  // history pop) find the module empty and render plain.
  const consumedRef = useRef<LesionFlightOrigin | null | undefined>(undefined);
  if (consumedRef.current === undefined) {
    consumedRef.current = consumeLesionFlight(String(caseItem.id));
  }
  const [flight, setFlight] = useState<LesionFlightOrigin | null>(
    reducedMotion ? null : consumedRef.current,
  );
  const landFlight = useCallback(() => setFlight(null), []);

  const choices: {
    value: CaseChoice;
    label: string;
    shortcut: 'B' | 'M' | 'S';
  }[] = [
    { value: 'benign', label: 'Benign', shortcut: 'B' },
    { value: 'malignant', label: 'Malignant', shortcut: 'M' },
    { value: 'skipped', label: 'Skip', shortcut: 'S' },
  ];

  return (
    <CaseStage
      eyebrow={eyebrow ?? <>Case · {shortCaseId(caseItem.id)}</>}
      title="What do you see?"
      // Reserve the meta line on review-bound surfaces so this header matches the
      // review's "Answered in Xs" line — the attempt → review swap is in-place,
      // so unequal header heights would jump the body down by a line.
      reserveMeta={flightToReview}
      headerActions={headerActionsNode}
      hero={
        <>
          <AnnotatedLesionImage
            src={caseItem.imageUrl}
            alt={`Case ${caseItem.id}`}
            aspect="4:5"
            features={[]}
            frameRef={heroRef}
            frameHidden={Boolean(flight)}
            eager
          />
          {flight && (
            <LesionFlight
              origin={flight}
              targetRef={heroRef}
              onLanded={landFlight}
            />
          )}
        </>
      }
    >
      <section className="flex flex-col gap-3">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          Clinical context
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{caseItem.site}</Badge>
          {caseItem.patientAge > 0 && (
            <Badge variant="outline">{caseItem.patientAge}y</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {caseItem.clinicalNote}
        </p>
      </section>

      <Hairline />

      <section className="flex flex-col gap-3">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          Your call · tap to commit
        </p>
        <div className="flex flex-col gap-2">
          {choices.map((c) => (
            <CaseChoiceCard
              key={c.value}
              choice={c.value}
              label={c.label}
              shortcut={c.shortcut}
              selected={committed === c.value}
              disabled={
                Boolean(committed) && committed !== c.value && !revealing
              }
              outcome={choiceOutcomes?.[c.value]}
              onSelect={() => handleCommit(c.value)}
            />
          ))}
        </div>

        {revealNode}

        {isPending && (
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <Spinner size="sm" variant="muted" />
            Saving your attempt…
          </p>
        )}

        {submitErrorNode}
      </section>
    </CaseStage>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

const CaseAttemptScene = () => {
  const queryClient = useQueryClient();
  const { caseId } = useParams();
  const safeCaseId = caseId ?? '';

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

  const { data: caseItem, isLoading, isError } = useCase(safeCaseId);

  const [committed, setCommitted] = useState<CaseChoice | null>(null);

  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset,
  } = useCaseSubmitAttempt();

  const { getElapsedMs } = useCaseTimer([safeCaseId]);

  useEffect(() => {
    setCommitted(null);
  }, [safeCaseId]);

  const onCommit = useCallback(
    (choice: CaseChoice) => {
      if (!safeCaseId || committed || isPending) return;
      reset();
      setCommitted(choice);
      const timeToAnswerMs = getElapsedMs();

      // Fire submit immediately; let the ring-fill animation play in
      // parallel. Navigate to review after the longer of (ring-fill,
      // submit). RING_FILL_MS is the minimum perceptible delay so the user
      // sees the confirmation animation before the route changes.
      submitAttempt(
        {
          caseId: safeCaseId,
          attempt: { chosenLabel: choice, timeToAnswerMs },
        },
        {
          onSuccess: () => {
            window.setTimeout(() => {
              navigate(paths.app['case-review'].getHref(safeCaseId));
            }, RING_FILL_MS);
          },
        },
      );
    },
    [
      committed,
      isPending,
      safeCaseId,
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
      navigate(paths.app['case-random'].getHref());
    },
    onExit: () => navigate(paths.app.cases.getHref()),
  });

  if (!safeCaseId) return <CaseMissing />;
  if (isLoading) return <CaseAttemptSkeleton />;
  if (isError || !caseItem) return <CaseMissing />;

  return (
    <CaseAttemptView
      caseItem={caseItem}
      committed={committed}
      isPending={isPending}
      onCommit={onCommit}
      flightToReview
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

export default CaseAttemptScene;

/* ────────────────────────────────────────────────────────────────────────── */

const CaseMissing = () => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
    <h2 className="font-display text-4xl">Case not found.</h2>
    <p className="text-muted-foreground text-sm">
      It may have been removed, or you may not have access.
    </p>
    <Button asChild>
      <Link to={paths.app.cases.getHref()}>Back to library</Link>
    </Button>
  </div>
);
