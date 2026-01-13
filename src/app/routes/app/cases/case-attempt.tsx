import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { paths } from '@/config/paths';
import { useCase } from '@/features/cases/api/use-case.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { Kbd } from '@/components/ui/kbd.tsx';
import { useCaseAttemptShortcuts } from '@/features/cases/hooks/use-case-attempt-shortcuts.ts';
import { useQueryClient } from '@tanstack/react-query';
import { useCaseTimer } from '@/features/cases/hooks/use-case-timer.ts';
import { queryKeys } from '@/lib/query-keys.ts';

export type Label = 'benign' | 'malignant';

type CaseAttemptViewProps = {
  caseItem: {
    id: string | number;
    imageUrl: string;
    site: string;
    patientAge: number;
    clinicalNote: string;
  };
  choice: Label | null;
  setChoice: (v: Label) => void;
  elapsedLabel: string;
  isPending: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  submitErrorNode?: ReactNode;
  newCaseNode: ReactNode;
};

export const CaseAttemptView = ({
  caseItem,
  choice,
  setChoice,
  elapsedLabel,
  isPending,
  canSubmit,
  onSubmit,
  submitErrorNode,
  newCaseNode,
}: CaseAttemptViewProps) => {
  const [showClinicalContext, setShowClinicalContext] = useState(false);
  return (
    <div className="flex min-h-0 flex-col gap-4 py-4 sm:py-6 text-left">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Case attempt</h1>
          <p className="text-sm text-muted-foreground">Case {caseItem.id}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link to={paths.app.cases.getHref()}>Case Library</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={caseItem.imageUrl}
                  alt={`Case ${caseItem.id}`}
                  className="w-full object-contain max-h-[60vh] sm:max-h-none"
                  loading="eager"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-1">
            <Collapsible
              open={showClinicalContext}
              onOpenChange={setShowClinicalContext}
              className="lg:hidden rounded-lg border bg-card px-4 py-3"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-muted-foreground">
                <span>Clinical context</span>
                <span className="flex items-center gap-2 text-xs">
                  {showClinicalContext ? 'Hide' : 'Show'}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${showClinicalContext ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </span>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3 space-y-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Metadata
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{caseItem.site}</Badge>
                    {caseItem.patientAge > 0 && (
                      <Badge variant="outline">{caseItem.patientAge}y</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Clinical note
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {caseItem.clinicalNote}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="hidden lg:block space-y-4 sm:space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Case metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{caseItem.site}</Badge>
                    {caseItem.patientAge > 0 && (
                      <Badge variant="outline">{caseItem.patientAge}y</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clinical note</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {caseItem.clinicalNote}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Your answer</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Time: {elapsedLabel}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant={choice === 'benign' ? 'default' : 'secondary'}
                    onClick={() => setChoice('benign')}
                    disabled={isPending}
                  >
                    <span className="hidden sm:inline-flex">
                      <Kbd>B</Kbd>
                    </span>
                    Benign
                  </Button>
                  <Button
                    type="button"
                    variant={choice === 'malignant' ? 'default' : 'secondary'}
                    onClick={() => setChoice('malignant')}
                    disabled={isPending}
                  >
                    <span className="hidden sm:inline-flex">
                      <Kbd>M</Kbd>
                    </span>
                    Malignant
                  </Button>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                >
                  <span className="hidden sm:inline-flex">
                    <Kbd>⏎</Kbd>
                  </span>
                  {isPending ? 'Submitting…' : 'Submit'}
                </Button>

                {submitErrorNode}

                <Separator />
              </CardContent>

              <CardFooter className="mt-auto flex flex-col items-stretch gap-2">
                {newCaseNode}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const [choice, setChoice] = useState<Label | null>(null);
  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset,
  } = useCaseSubmitAttempt();

  // Use reusable timer hook
  const { elapsedLabel, getElapsedMs } = useCaseTimer([safeCaseId]);
  useEffect(() => {
    setChoice(null);
  }, [safeCaseId]);

  const canSubmit = Boolean(choice) && !isPending;

  const onSubmit = useCallback(() => {
    if (!choice || !safeCaseId) return;

    // clear any previous mutation error
    reset();

    const timeToAnswerMs = getElapsedMs();

    submitAttempt(
      { caseId: safeCaseId, attempt: { chosenLabel: choice, timeToAnswerMs } },
      {
        onSuccess: () => {
          navigate(paths.app['case-review'].getHref(safeCaseId));
        },
      },
    );
  }, [choice, safeCaseId, reset, submitAttempt, navigate, getElapsedMs]);

  useCaseAttemptShortcuts({
    enabled: Boolean(caseItem) && !isCoarsePointer,
    canSubmit,
    isPending,
    onSelectBenign: () => setChoice('benign'),
    onSelectMalignant: () => setChoice('malignant'),
    onSubmit,
    onNewCase: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys['random-case'] });
      navigate(0);
    },
    onExit: () => navigate(paths.app.cases.getHref()),
  });

  if (!safeCaseId) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Missing case id.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.cases.getHref()}>Back to cases</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading case…</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please wait.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We couldn’t load this case. It may have been removed or you may not
            have access.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.cases.getHref()}>Back to cases</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="py-4 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Case not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Missing case id.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.cases.getHref()}>Back to cases</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <CaseAttemptView
      caseItem={caseItem}
      choice={choice}
      setChoice={setChoice}
      elapsedLabel={elapsedLabel}
      isPending={isPending}
      canSubmit={canSubmit}
      onSubmit={onSubmit}
      submitErrorNode={
        isSubmitError ? (
          <p className="text-xs text-red-700">
            {submitError instanceof Error
              ? submitError.message
              : 'Could not submit attempt. Please try again.'}
          </p>
        ) : null
      }
      newCaseNode={
        <Button asChild variant="outline">
          <Link to={paths.app['case-random'].getHref()}>
            <span className="hidden sm:inline-flex">
              <Kbd>N</Kbd>
            </span>
            New case
          </Link>
        </Button>
      }
    />
  );
};

export default CaseAttemptScene;
