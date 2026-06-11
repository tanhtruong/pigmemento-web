import { useMemo } from 'react';
import { Link } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Hairline } from '@/components/foundation/hairline';
import { CalendarHeatmap } from '@/components/signature/calendar-heatmap';
import { paths } from '@/config/paths';
import { useCaseHistory } from '@/features/cases/api/use-case-history.ts';
import type { CaseListItem } from '@/features/cases/types/case-list-item.ts';
import { cn } from '@/lib/utils';

type AttemptedCaseListItem = CaseListItem & {
  lastAttempt: NonNullable<CaseListItem['lastAttempt']>;
};

const isAttempted = (c: CaseListItem): c is AttemptedCaseListItem =>
  Boolean(c.lastAttempt);

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isoDay = (d: Date) => startOfDay(d).toISOString().slice(0, 10);

const firstNameFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = jwtDecode<{ name?: string; email?: string }>(token);
    const first = decoded.name?.split(/\s+/)[0];
    if (first) return first;
    if (decoded.email) return decoded.email.split('@')[0];
    return null;
  } catch {
    return null;
  }
};

const formatRelative = (iso: string): string => {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });
};

const Dashboard = () => {
  const { data: caseHistory = [] } = useCaseHistory();

  const firstName = useMemo(() => firstNameFromToken(), []);

  const attemptedCases = useMemo(
    () => caseHistory.filter(isAttempted),
    [caseHistory],
  );

  const metrics = useMemo(() => {
    const attempts = attemptedCases.map((c) => c.lastAttempt);
    const todayStart = startOfDay(new Date()).getTime();
    const weekStart = todayStart - 6 * 86_400_000;
    const monthStart = todayStart - 29 * 86_400_000;

    const today = attempts.filter(
      (a) => new Date(a.createdAt).getTime() >= todayStart,
    );
    const week = attempts.filter(
      (a) => new Date(a.createdAt).getTime() >= weekStart,
    );
    const month = attempts.filter(
      (a) => new Date(a.createdAt).getTime() >= monthStart,
    );

    const accuracy = (list: typeof attempts) =>
      list.length
        ? Math.round((list.filter((a) => a.correct).length / list.length) * 100)
        : 0;

    return {
      totalCases: attempts.length,
      totalMs: attempts.reduce((s, a) => s + (a.timeToAnswerMs ?? 0), 0),
      today: today.length,
      week: week.length,
      month: month.length,
      accuracy7d: accuracy(week),
      accuracyPriorWeek: accuracy(
        attempts.filter((a) => {
          const t = new Date(a.createdAt).getTime();
          return t < weekStart && t >= weekStart - 7 * 86_400_000;
        }),
      ),
    };
  }, [attemptedCases]);

  // Daily counts for the 14-day sparkline + 12-week heatmap.
  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of attemptedCases) {
      const key = isoDay(new Date(c.lastAttempt.createdAt));
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [attemptedCases]);

  const sparkline14d = useMemo(() => {
    const today = startOfDay(new Date());
    const values: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      values.push(dailyCounts[isoDay(d)] ?? 0);
    }
    return values;
  }, [dailyCounts]);

  // Pattern intelligence — accuracy delta by site (proxy for "category").
  const stumblePanel = useMemo(() => {
    const bySite: Record<string, { correct: number; total: number }> = {};
    for (const a of attemptedCases) {
      const site = a.site || 'other';
      const slot = bySite[site] ?? { correct: 0, total: 0 };
      slot.total += 1;
      if (a.lastAttempt.correct) slot.correct += 1;
      bySite[site] = slot;
    }
    const sites = Object.entries(bySite)
      .filter(([, s]) => s.total >= 2)
      .map(([site, s]) => ({
        site,
        accuracy: Math.round((s.correct / s.total) * 100),
        total: s.total,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    if (sites.length === 0) return null;
    const lowest = sites[0];
    return lowest;
  }, [attemptedCases]);

  const recentAttempts = useMemo(() => {
    return attemptedCases
      .slice()
      .sort(
        (a, b) =>
          new Date(b.lastAttempt.createdAt).getTime() -
          new Date(a.lastAttempt.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [attemptedCases]);

  const accuracyDelta = metrics.accuracy7d - metrics.accuracyPriorWeek;

  const totalStudyMinutes = Math.round(metrics.totalMs / 60_000);

  return (
    <article className="flex flex-col gap-12 py-4">
      {/* 1. Greeting + suggested next */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-primary font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Progress
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            {firstName ? `Good to see you, ${firstName}.` : 'Good to see you.'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {metrics.today > 0
              ? `You've completed ${metrics.today} ${metrics.today === 1 ? 'case' : 'cases'} today. Keep the pattern alive.`
              : 'Start your first case — short sessions compound fast.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="sm:w-fit">
            <Link to={paths.app['case-random'].getHref()}>
              {metrics.today > 0 ? 'Continue practicing' : 'Start a case'}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="sm:w-fit">
            <Link to={paths.app['case-drill'].getHref()}>Start a drill</Link>
          </Button>
        </div>
      </header>

      <Hairline />

      {/* 2. One hero metric */}
      <section className="grid gap-8 sm:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Today
          </p>
          <p className="font-display text-foreground text-6xl leading-none tabular-nums sm:text-7xl">
            {metrics.today}
          </p>
          <p className="text-muted-foreground text-xs">
            {metrics.week} this week · {metrics.month} this month
          </p>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Last 14 days
          </p>
          <Sparkline values={sparkline14d} />
        </div>
      </section>

      <Hairline />

      {/* 3. Where you're growing / Where you stumble */}
      <section className="grid gap-4 sm:grid-cols-2">
        <PatternPanel
          eyebrow="Where you're growing"
          dotClass="bg-correct"
          headline={
            metrics.accuracy7d > 0
              ? `Accuracy this week — ${metrics.accuracy7d}%`
              : 'No 7-day signal yet.'
          }
          detail={
            metrics.accuracyPriorWeek > 0
              ? `${accuracyDelta >= 0 ? '+' : ''}${accuracyDelta} pts vs the prior week.`
              : 'Practice a few more cases to see the trend.'
          }
        />
        <PatternPanel
          eyebrow="Where you stumble"
          dotClass="bg-incorrect"
          headline={
            stumblePanel
              ? `${capitalize(stumblePanel.site)} cases — ${stumblePanel.accuracy}%`
              : 'No pattern yet.'
          }
          detail={
            stumblePanel
              ? `Across ${stumblePanel.total} attempts. Drilling this category sharpens the call fastest.`
              : 'Keep going — patterns surface after a few more attempts.'
          }
          cta={
            stumblePanel ? (
              <Button asChild variant="ghost" size="sm" className="-ml-2 mt-1">
                <Link to={paths.app.cases.getHref()}>
                  Drill {stumblePanel.site} cases
                  <ArrowUpRight />
                </Link>
              </Button>
            ) : null
          }
        />
      </section>

      <Hairline />

      {/* 4. Recent attempts journal */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Recent attempts
          </p>
          <Link
            to={paths.app.cases.getHref()}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            See all →
          </Link>
        </div>
        {recentAttempts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No attempts yet. Start your first case to begin your journal.
          </p>
        ) : (
          <ul className="flex flex-col">
            {recentAttempts.map((c, i) => {
              const correct = c.lastAttempt.correct;
              const skipped = c.lastAttempt.chosenLabel === 'skipped';
              return (
                <li key={c.id}>
                  {i > 0 && <Hairline />}
                  <Link
                    to={paths.app['case-review'].getHref(c.id)}
                    className="hover:bg-accent/40 group/row flex items-center gap-4 py-3 transition-colors"
                  >
                    <div className="bg-muted/40 border-hairline relative h-12 w-12 shrink-0 overflow-hidden rounded-input border">
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground font-mono text-xs">
                        CASE · {c.id}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {capitalize(c.site)} · {c.patientAge}y
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-block h-2 w-2 shrink-0 rounded-full',
                        skipped
                          ? 'bg-muted-foreground'
                          : correct
                            ? 'bg-correct'
                            : 'bg-incorrect',
                      )}
                      aria-hidden
                    />
                    <span className="text-muted-foreground shrink-0 font-mono text-[0.65rem] tabular-nums">
                      {formatRelative(c.lastAttempt.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Hairline />

      {/* 5. Calendar heatmap */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Last 12 weeks
          </p>
          <p className="text-muted-foreground font-mono text-[0.65rem] tabular-nums">
            {Object.keys(dailyCounts).length} active days
          </p>
        </div>
        <CalendarHeatmap data={dailyCounts} weeks={12} />
      </section>

      <Hairline />

      {/* 6. Footer Geist Mono totals */}
      <footer className="text-muted-foreground font-mono text-[0.6875rem] tracking-wider uppercase">
        Total cases: {metrics.totalCases} · Total study time:{' '}
        {totalStudyMinutes < 60
          ? `${totalStudyMinutes}m`
          : `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`}
      </footer>
    </article>
  );
};

export default Dashboard;

/* ────────────────────────────────────────────────────────────────────────── */

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const Sparkline = ({ values }: { values: number[] }) => {
  const max = Math.max(1, ...values);
  const w = 100;
  const h = 28;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(' ');
  const lastX = (values.length - 1) * step;
  const lastY = h - (values[values.length - 1] / max) * h;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="text-primary w-full" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={1.6}
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const PatternPanel = ({
  eyebrow,
  dotClass,
  headline,
  detail,
  cta,
}: {
  eyebrow: string;
  dotClass: string;
  headline: string;
  detail: string;
  cta?: React.ReactNode;
}) => (
  <div className="border-hairline shadow-warm-sm flex flex-col gap-2 rounded-card border bg-card p-5">
    <div className="text-muted-foreground flex items-center gap-2 font-mono text-[0.65rem] tracking-wider uppercase">
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotClass)} />
      {eyebrow}
    </div>
    <p className="font-display text-foreground text-xl leading-tight">
      {headline}
    </p>
    <p className="text-muted-foreground text-sm">{detail}</p>
    {cta}
  </div>
);
