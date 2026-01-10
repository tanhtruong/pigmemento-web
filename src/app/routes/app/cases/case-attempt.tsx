import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

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
import { useCase } from '@/features/cases/api/use-case.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';

type Label = 'benign' | 'malignant';

const CaseAttemptScene = () => {
  const { caseId } = useParams();
  const safeCaseId = caseId ?? '';

  const navigate = useNavigate();

  const startedAtRef = useRef<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const { data: caseItem, isLoading, isError } = useCase(safeCaseId);

  const [choice, setChoice] = useState<Label | null>(null);
  const {
    mutate: submitAttempt,
    isPending,
    isError: isSubmitError,
    error: submitError,
    reset,
  } = useCaseSubmitAttempt();

  useEffect(() => {
    // Start (or restart) timer when opening a case
    startedAtRef.current = performance.now();
    setElapsedMs(0);
    setChoice(null);

    const interval = window.setInterval(() => {
      setElapsedMs(Math.max(0, performance.now() - startedAtRef.current));
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [safeCaseId]);

  const canSubmit = Boolean(choice) && !isPending;

  const elapsedLabel = useMemo(() => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedMs]);

  const onSubmit = () => {
    if (!choice || !safeCaseId) return;

    // clear any previous mutation error
    reset();

    const timeToAnswerMs = Math.max(
      0,
      Math.round(performance.now() - startedAtRef.current),
    );

    submitAttempt(
      { caseId: safeCaseId, attempt: { chosenLabel: choice, timeToAnswerMs } },
      {
        onSuccess: () => {
          navigate(paths.app['case-review'].getHref(safeCaseId));
        },
      },
    );
  };

  if (!safeCaseId) {
    return (
      <div className="py-6">
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
      <div className="py-6">
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

  if (isError || !caseItem) {
    return (
      <div className="py-6">
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

  return (
    <div className="flex h-[100dvh] flex-col gap-4 overflow-hidden py-6 text-left">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case attempt</h1>
          <p className="text-muted-foreground">Case {caseItem.id}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to={paths.app.cases.getHref()}>All cases</Link>
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={caseItem.imageUrl}
                  alt={`Case ${caseItem.id}`}
                  className="w-full object-contain"
                  loading="eager"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5 lg:col-span-1">
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
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Your answer</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Time: {elapsedLabel}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={choice === 'benign' ? 'default' : 'secondary'}
                    onClick={() => setChoice('benign')}
                    disabled={isPending}
                  >
                    Benign
                  </Button>
                  <Button
                    type="button"
                    variant={choice === 'malignant' ? 'default' : 'secondary'}
                    onClick={() => setChoice('malignant')}
                    disabled={isPending}
                  >
                    Malignant
                  </Button>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                >
                  {isPending ? 'Submitting…' : 'Submit'}
                </Button>

                {isSubmitError ? (
                  <p className="text-xs text-red-700">
                    {submitError instanceof Error
                      ? submitError.message
                      : 'Could not submit attempt. Please try again.'}
                  </p>
                ) : null}

                <Separator />
              </CardContent>

              <CardFooter className="mt-auto flex flex-col items-stretch gap-2">
                <Button asChild variant="outline">
                  <Link to={paths.app['case-random'].getHref()}>New case</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseAttemptScene;
