import { type ReactNode } from 'react';
import {
  Link,
  useParams,
  useViewTransitionState,
  type LoaderFunctionArgs,
} from 'react-router';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

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
import { queryKeys } from '@/lib/query-keys.ts';
import { CaseStage } from '@/components/cases/case-stage.tsx';
import { useInAppNavigate } from '@/components/layouts/use-in-app-navigate.ts';
import { AnnotatedLesionImage } from '@/components/signature/annotated-lesion-image.tsx';
import { shortCaseId } from '@/features/cases/lib/case-id.ts';
import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';
import { motionTokens, VERDICT_ENTER_OPACITY } from '@/lib/motion-tokens';
import { CaseAttemptFlow } from './case-attempt-flow.tsx';

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
  /** The h1. Defaults to "What do you see?"; the verdict swaps it to "Review". */
  title?: ReactNode;
  /** Mono sub-line under the title — e.g. "Answered in 4.2s" once resolved. */
  meta?: ReactNode;
  /**
   * Reserve the meta line's height while `meta` is absent. The in-scene flow
   * sets this so the question-phase header matches the resolved header (which
   * carries "Answered in Xs") — otherwise the meta appearing on resolve grows
   * the header and shoves the hero down a line. The drill leaves it unset.
   */
  reserveMeta?: boolean;
  /**
   * Per-choice reveal colours (#61). When present, the choices section is in
   * its revealed state: cards show correct/incorrect/reveal-correct and are no
   * longer dimmed. The drill sets this for its compact inline reveal.
   */
  choiceOutcomes?: Partial<Record<CaseChoice, CaseChoiceOutcome>>;
  /** Verdict line shown under the choices during the drill's inline reveal. */
  revealNode?: ReactNode;
  /**
   * The verdict in place (#85). When set, committing swaps the working column
   * from the choices to this node while the lesion hero stays put — the answer
   * resolves where the question stood, no route change. The drill leaves this
   * unset (it keeps the choices and reveals inline); only the single/random
   * flow swaps to a full verdict.
   */
  verdictNode?: ReactNode;
  /** True once the verdict is showing — annotates the hero, swaps the column. */
  resolved?: boolean;
  /** ABCDE markers drawn on the hero once resolved. */
  heroFeatures?: AbcdeFeature[];
  /** Hero caption once resolved — e.g. "CASE 4F2A · MALIGNANT". */
  heroSourceCredit?: string;
  /**
   * View Transition name for the hero frame (#106). The id-attempt route passes
   * `case-hero` while a Library card is morphing in; drill / random leave it
   * unset (no card to morph from).
   */
  frameViewTransitionName?: string;
};

export const CaseAttemptView = ({
  caseItem,
  committed,
  isPending,
  onCommit,
  submitErrorNode,
  headerActionsNode,
  eyebrow,
  title,
  meta,
  reserveMeta,
  choiceOutcomes,
  revealNode,
  verdictNode,
  resolved = false,
  heroFeatures,
  heroSourceCredit,
  frameViewTransitionName,
}: CaseAttemptViewProps) => {
  const revealing = Boolean(choiceOutcomes);
  const reducedMotion = useReducedMotion();

  const choices: {
    value: CaseChoice;
    label: string;
    shortcut: 'B' | 'M' | 'S';
  }[] = [
    { value: 'benign', label: 'Benign', shortcut: 'B' },
    { value: 'malignant', label: 'Malignant', shortcut: 'M' },
    { value: 'skipped', label: 'Skip', shortcut: 'S' },
  ];

  const questionColumn = (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          Clinical context
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="fact">{caseItem.site}</Badge>
          {caseItem.patientAge > 0 && (
            <Badge variant="fact">{caseItem.patientAge}y</Badge>
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
          {choices.map((c, i) => {
            // The unchosen cards retire as the chosen card commits — but only on
            // a live commit, never the drill's inline recolour (#98).
            const unchosen =
              Boolean(committed) && committed !== c.value && !revealing;
            return (
              <CaseChoiceCard
                key={c.value}
                choice={c.value}
                label={c.label}
                shortcut={c.shortcut}
                selected={committed === c.value}
                disabled={unchosen}
                receding={unchosen}
                recedeDelay={i * 0.04}
                outcome={choiceOutcomes?.[c.value]}
                onSelect={() => onCommit(c.value)}
              />
            );
          })}
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
    </div>
  );

  // The working column swaps choices ↔ verdict in place (#85). Only the
  // single/random flow passes a verdictNode; the drill keeps the choices, so it
  // renders the question column directly with no swap.
  let workingColumn: ReactNode = questionColumn;
  if (verdictNode) {
    const active = resolved ? verdictNode : questionColumn;
    workingColumn = reducedMotion ? (
      active
    ) : (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolved ? 'verdict' : 'question'}
          className="flex flex-col gap-8"
          // Enter from a floor (not blank) so the swap firms up over the
          // verdict's own divider-draw; the outgoing column leaves quickly so
          // there's no empty-column gap between them (#98).
          initial={{ opacity: VERDICT_ENTER_OPACITY }}
          animate={{ opacity: 1, transition: motionTokens.normal }}
          exit={{ opacity: 0, transition: motionTokens.quick }}
        >
          {active}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <CaseStage
      eyebrow={eyebrow ?? <>Case · {shortCaseId(caseItem.id)}</>}
      title={title ?? 'What do you see?'}
      meta={meta}
      reserveMeta={reserveMeta}
      headerActions={headerActionsNode}
      hero={
        <AnnotatedLesionImage
          src={caseItem.imageUrl}
          alt={`Case ${caseItem.id}`}
          aspect="4:5"
          features={resolved ? (heroFeatures ?? []) : []}
          sourceCredit={resolved ? heroSourceCredit : undefined}
          showAnnotations={resolved}
          acknowledged={Boolean(committed)}
          frameViewTransitionName={frameViewTransitionName}
          eager
        />
      }
    >
      {workingColumn}
    </CaseStage>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

const CaseAttemptScene = () => {
  const queryClient = useQueryClient();
  const { caseId } = useParams();
  const safeCaseId = caseId ?? '';
  const inAppNavigate = useInAppNavigate();

  // Pair the hero with the Library card it was opened from (#106): while the
  // View Transition into this case is live, both carry `case-hero` and the
  // browser morphs the thumb into the hero. Only this id route does it — drill /
  // random reach the same view with no originating card.
  const heroMorphing = useViewTransitionState(
    paths.app['case-attempt'].getHref(safeCaseId),
  );

  const { data: caseItem, isLoading, isError } = useCase(safeCaseId);

  if (!safeCaseId) return <CaseMissing />;
  if (isLoading) return <CaseAttemptSkeleton />;
  if (isError || !caseItem) return <CaseMissing />;

  return (
    <CaseAttemptFlow
      caseItem={caseItem}
      frameViewTransitionName={heroMorphing ? 'case-hero' : undefined}
      // A keyed case can be re-entered already answered (refresh, history pop,
      // a dashboard tap): boot straight to the verdict when an attempt exists.
      resumeIfAnswered
      onNextCase={() => {
        queryClient.invalidateQueries({ queryKey: queryKeys['random-case'] });
        inAppNavigate(paths.app['case-random'].getHref());
      }}
      onExit={() => inAppNavigate(paths.app.cases.getHref())}
      headerActionsNode={
        <Button asChild variant="ghost" size="sm">
          <Link to={paths.app.cases.getHref()} viewTransition>
            ← Library
          </Link>
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
      <Link to={paths.app.cases.getHref()} viewTransition>
        Back to library
      </Link>
    </Button>
  </div>
);
