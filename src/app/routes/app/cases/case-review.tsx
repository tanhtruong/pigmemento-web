import { Link, useParams } from 'react-router';

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
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import { useCase } from '@/features/cases/api/use-case.ts';

export const CaseReviewScene = () => {
  const { caseId } = useParams();
  const safeCaseId = caseId ?? '';

  if (!safeCaseId) {
    return (
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid case</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Missing case identifier.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.dashboard.getHref()}>Back to dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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

  const correct = attempt
    ? attempt.correctLabel === attempt.chosenLabel
    : false;

  if (isCaseLoading || isAttemptLoading) {
    return (
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading review…</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please wait.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCaseError || isAttemptError || !attempt || !caseItem) {
    return (
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Review not available</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We couldn’t load the review for this case.
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to={paths.app.dashboard.getHref()}>Back to dashboard</Link>
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
          <h1 className="text-3xl font-bold">Case review</h1>
          <p className="text-muted-foreground">Case {caseItem.id}</p>
        </div>
        <Button asChild variant="secondary">
          <Link to={paths.app.cases.getHref()}>All cases</Link>
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Image */}
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your answer</span>
                  <span className="font-medium">{attempt.chosenLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ground truth</span>
                  <span className="font-medium">{attempt.correctLabel}</span>
                </div>
                <Separator />
                <div
                  className={
                    correct
                      ? 'text-green-700 font-medium'
                      : 'text-red-700 font-medium'
                  }
                >
                  {correct ? 'Correct' : 'Incorrect'}
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Model output (educational)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Benign</span>
                  <span>{formatPercent(data.modelProbs.benign)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Malignant</span>
                  <span>{formatPercent(data.modelProbs.malignant)}</span>
                </div>
                <p className="pt-2 text-xs text-muted-foreground">
                  These probabilities are shown for training purposes only and
                  must not be used for diagnosis.
                </p>
              </CardContent>
            </Card>*/}

            <Card>
              <CardHeader>
                <CardTitle>Teaching points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {attempt.teachingPoints && attempt.teachingPoints.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {attempt.teachingPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No teaching points are available for this case yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CAM + Teaching points */}
          {/*<Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Model attention (Grad-CAM)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.camUrl ? (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={data.camUrl}
                    alt="Grad-CAM"
                    className="w-full object-contain"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attention map available.
                </p>
              )}
            </CardContent>
          </Card>*/}
        </div>
      </div>
    </div>
  );
};

export default CaseReviewScene;
