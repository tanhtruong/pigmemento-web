import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import type { CaseListItem } from '@/features/cases/types/case-list-item.ts';
import { useCases } from '@/features/cases/api/use-cases.ts';
import { Badge } from '@/components/ui/badge.tsx';

const safeLower = (v: string) => v.trim().toLowerCase();

const formatAttemptMeta = (c: CaseListItem) => {
  if (!c.lastAttempt) {
    return {
      label: 'Not attempted',
      when: null as string | null,
      time: null as string | null,
      attempted: false,
      correct: null as boolean | null,
    };
  }

  const d = new Date(c.lastAttempt.createdAt);
  const when = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  // timeToAnswerMs may not exist on all list payloads, so guard it
  const tta = (c.lastAttempt as any)?.timeToAnswerMs as number | undefined;
  const time = typeof tta === 'number' ? `${Math.round(tta / 1000)}s` : null;

  return {
    label: c.lastAttempt.correct ? 'Correct' : 'Incorrect',
    when,
    time,
    attempted: true,
    correct: Boolean(c.lastAttempt.correct),
  };
};

const CasesScene = () => {
  const { data: cases = [], isLoading, isError } = useCases();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [difficulty, setDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard'
  >('all');
  const [attempted, setAttempted] = useState<
    'all' | 'attempted' | 'unattempted'
  >('all');

  const [sort, setSort] = useState<
    'recommended' | 'newest' | 'difficulty' | 'id'
  >('recommended');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const q = safeLower(debouncedQuery);

    const difficultyRank: Record<string, number> = {
      easy: 0,
      medium: 1,
      hard: 2,
    };

    const base = cases
      .filter((c) => {
        if (difficulty === 'all') return true;
        return String(c.difficulty) === difficulty;
      })
      .filter((c) => {
        if (attempted === 'all') return true;
        return attempted === 'attempted'
          ? Boolean(c.lastAttempt)
          : !c.lastAttempt;
      })
      .filter((c) => {
        if (!q) return true;
        // Search by id, site, and age
        return (
          safeLower(String(c.id)).includes(q) ||
          safeLower(String(c.site)).includes(q) ||
          String(c.patientAge).includes(q)
        );
      });

    const sorted = [...base].sort((a, b) => {
      if (sort === 'id') return String(a.id).localeCompare(String(b.id));

      if (sort === 'difficulty') {
        const ar = difficultyRank[String(a.difficulty)] ?? 99;
        const br = difficultyRank[String(b.difficulty)] ?? 99;
        if (ar !== br) return ar - br;
        return String(a.id).localeCompare(String(b.id));
      }

      if (sort === 'newest') {
        const ad = a.lastAttempt
          ? new Date(a.lastAttempt.createdAt).getTime()
          : -1;
        const bd = b.lastAttempt
          ? new Date(b.lastAttempt.createdAt).getTime()
          : -1;
        // attempted with newer dates first; unattempted last
        return bd - ad;
      }

      // recommended: unattempted first, then most recent, then id
      const aAttempted = Boolean(a.lastAttempt);
      const bAttempted = Boolean(b.lastAttempt);
      if (aAttempted !== bAttempted) return aAttempted ? 1 : -1;

      const ad = a.lastAttempt
        ? new Date(a.lastAttempt.createdAt).getTime()
        : 0;
      const bd = b.lastAttempt
        ? new Date(b.lastAttempt.createdAt).getTime()
        : 0;
      if (ad !== bd) return bd - ad;

      return String(a.id).localeCompare(String(b.id));
    });

    return sorted;
  }, [attempted, cases, debouncedQuery, difficulty, sort]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-background py-6 text-left text-foreground">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Library</h1>
          <p className="text-muted-foreground">
            Explore the case library, filter by difficulty and status, and jump
            into a random case when you’re ready to train.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button asChild className="shadow-sm">
            <Link to={paths.app['case-random'].getHref()}>Random case</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to={paths.app['case-drill'].getHref()}>Start drill</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={paths.app.dashboard.getHref()}>Back to dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Search
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by id, site, age…"
            />
          </div>

          <div className="sm:w-64">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Sort
            </label>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Recommended" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="newest">Newest attempted</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="id">Case ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(query ||
            difficulty !== 'all' ||
            attempted !== 'all' ||
            sort !== 'recommended') && (
            <div className="sm:ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                  setDifficulty('all');
                  setAttempted('all');
                  setSort('recommended');
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="md:flex gap-10">
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Difficulty
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'easy', 'medium', 'hard'] as const).map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={difficulty === v ? 'default' : 'outline'}
                  onClick={() => setDifficulty(v)}
                  aria-pressed={difficulty === v}
                >
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Status
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'unattempted', 'attempted'] as const).map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={attempted === v ? 'default' : 'outline'}
                  onClick={() => setAttempted(v)}
                  aria-pressed={attempted === v}
                >
                  {v === 'all'
                    ? 'All'
                    : v === 'unattempted'
                      ? 'Unattempted'
                      : 'Attempted'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">{filtered.length}</span>{' '}
          of <span className="font-medium text-foreground">{cases.length}</span>{' '}
          cases
        </div>
      </section>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Could not load cases. Please try again.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No cases match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="group flex flex-col border-border bg-card transition-colors hover:bg-muted/40 hover:shadow-sm"
              >
                <CardHeader className="py-1.5">
                  <CardTitle className="text-sm">Case {c.id}</CardTitle>
                  {(() => {
                    const meta = formatAttemptMeta(c);
                    return (
                      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-muted-foreground">
                        {meta.attempted ? (
                          <Badge
                            variant={meta.correct ? 'default' : 'secondary'}
                          >
                            {meta.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{meta.label}</Badge>
                        )}
                        {meta.when && <span>{meta.when}</span>}
                        {meta.time && (
                          <span className="tabular-nums text-muted-foreground">
                            • {meta.time}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </CardHeader>

                <CardContent className="space-y-1.5">
                  <div className="overflow-hidden rounded-md border">
                    <img
                      src={c.imageUrl}
                      alt={`Case ${c.id}`}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">
                      {String(c.difficulty).toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{c.site}</Badge>
                    {c.patientAge > 0 && (
                      <Badge variant="outline">{c.patientAge}y</Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="mt-auto pt-1">
                  <Button asChild size="sm" className="h-8 w-full">
                    <Link to={paths.app['case-attempt'].getHref(c.id)}>
                      {c.lastAttempt ? 'Try again' : 'Start case'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesScene;
