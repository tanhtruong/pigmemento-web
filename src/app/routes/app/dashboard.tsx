import { useMemo } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { paths } from '@/config/paths';
import { useCaseHistory } from '@/features/cases/api/use-case-history.ts';
import type { CaseListItem } from '@/features/cases/types/case-list-item.ts';
import { Badge } from '@/components/ui/badge.tsx';

const formatMs = (ms: number) => {
  const s = Math.round(ms / 100) / 10;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round((s - m * 60) * 10) / 10;
  return `${m}m ${rem}s`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

type AttemptedCaseListItem = CaseListItem & {
  lastAttempt: NonNullable<CaseListItem['lastAttempt']>;
};

const isAttempted = (c: CaseListItem): c is AttemptedCaseListItem =>
  Boolean(c.lastAttempt);

const Dashboard = () => {
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const { data: caseHistory = [] } = useCaseHistory();

  const attemptedCases = useMemo(
    () => caseHistory.filter(isAttempted),
    [caseHistory],
  );

  const metrics = useMemo(() => {
    const attempts = attemptedCases.map((c) => c.lastAttempt);

    const attempts7d = attempts.filter((a) => {
      const d = new Date(a.createdAt);
      return Date.now() - d.getTime() <= 1000 * 60 * 60 * 24 * 7;
    });

    const attemptsToday = attempts.filter((a) => {
      const d = new Date(a.createdAt);
      return d.getTime() >= startOfDay(new Date()).getTime();
    });

    const correct7d = attempts7d.filter((a) => a.correct).length;
    const accuracy7d = attempts7d.length
      ? Math.round((correct7d / attempts7d.length) * 100)
      : 0;

    const avgTimeMs = attempts7d.length
      ? Math.round(
          attempts7d.reduce((sum, a) => sum + a.timeToAnswerMs, 0) /
            attempts7d.length,
        )
      : 0;

    // Simple streak heuristic using attempt dates (replace with server truth later)
    const uniqueDays = Array.from(
      new Set(
        attempts
          .map((a) => startOfDay(new Date(a.createdAt)).getTime())
          .sort((x, y) => y - x),
      ),
    );

    let streak = 0;
    const today = startOfDay(new Date()).getTime();
    for (let i = 0; i < uniqueDays.length; i += 1) {
      const expected = today - streak * 24 * 60 * 60 * 1000;
      if (uniqueDays[i] === expected) streak += 1;
      else break;
    }

    return {
      attempts7d: attempts7d.length,
      attemptsToday: attemptsToday.length,
      accuracy7d,
      avgTimeMs,
      streak,
    };
  }, [attemptedCases]);

  const recentAttemptedCases = useMemo(() => {
    return attemptedCases
      .slice()
      .sort(
        (a, b) =>
          new Date(b.lastAttempt.createdAt).getTime() -
          new Date(a.lastAttempt.createdAt).getTime(),
      )
      .slice(0, 10);
  }, [attemptedCases]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden bg-background py-6 text-left text-foreground">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Today is {todayLabel}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="secondary">
            <Link to={paths.app.profile.getHref()}>Profile</Link>
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/15 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accuracy (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums text-primary">
                {metrics.accuracy7d}%
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on your last 7 days of attempts.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/15 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attempts (today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums text-primary">
                {metrics.attemptsToday}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep going—short sessions compound.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/15 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg time (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums text-primary">
                {metrics.avgTimeMs ? formatMs(metrics.avgTimeMs) : '—'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Speed matters less than consistency.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/15 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums text-primary">
                {metrics.streak} day{metrics.streak === 1 ? '' : 's'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Train daily to build pattern recognition.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid min-h-0 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 flex min-h-0 flex-col">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {recentAttemptedCases.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No attempts yet. Start a quiz to see your activity here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttemptedCases.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">Case {c.id}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatDateTime(c.lastAttempt.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            <Badge
                              variant={
                                c.lastAttempt.correct ? 'default' : 'secondary'
                              }
                              className="rounded-full"
                            >
                              {c.lastAttempt.correct ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatMs(c.lastAttempt.timeToAnswerMs)}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="space-y-1">
                          <div>
                            Your answer:{' '}
                            <span className="font-medium text-foreground">
                              {c.lastAttempt.chosenLabel}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.difficulty} • {c.site} • {c.patientAge}y
                          </div>
                        </div>
                        <div>
                          <Link
                            to={paths.app['case-review'].getHref(c.id)}
                            className="text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
                          >
                            Review case
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
                <div className="text-sm font-medium">Start a case</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Jump into a random case.
                </p>
                <div className="mt-3">
                  <Button size="sm" asChild className="shadow-sm">
                    <Link to={paths.app['case-random'].getHref()}>
                      Start case
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
                <div className="text-sm font-medium">Case drill</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose an amount of cases to do back-to-back. Focus on pattern
                  recognition, not perfection.
                </p>
                <div className="mt-3">
                  <Button asChild size="sm">
                    <Link to={paths.app['case-drill'].getHref()}>
                      Start drill
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
                <div className="text-sm font-medium">Review your misses</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Revisit incorrect answers—this is where learning happens.
                </p>
                <div className="mt-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={paths.app.profile.getHref()}>Open progress</Link>
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>
                  Educational use only — not for diagnosis or clinical
                  decision-making.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
