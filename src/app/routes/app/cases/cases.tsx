import { useMemo, useState } from 'react';
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
  if (!c.lastAttempt) return 'Not attempted yet';
  const d = new Date(c.lastAttempt.createdAt);
  const when = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  return `${c.lastAttempt.correct ? 'Correct' : 'Incorrect'} • ${when}`;
};

const CasesScene = () => {
  const { data: cases = [], isLoading, isError } = useCases();

  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard'
  >('all');
  const [attempted, setAttempted] = useState<
    'all' | 'attempted' | 'unattempted'
  >('all');

  const filtered = useMemo(() => {
    const q = safeLower(query);

    return cases
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
  }, [attempted, cases, difficulty, query]);

  return (
    <div className="flex h-[100dvh] flex-col gap-4 overflow-hidden py-6 text-left">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">
            Browse cases and keep training. Educational use only — not for
            diagnosis.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={paths.app.dashboard.getHref()}>Back to dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Search
          </label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, site, age…"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Difficulty
          </label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-1">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select
            value={attempted}
            onValueChange={(v) => setAttempted(v as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="attempted">Attempted</SelectItem>
              <SelectItem value="unattempted">Unattempted</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Could not load cases. Please try again.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            No cases match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Case {c.id}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {formatAttemptMeta(c)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="overflow-hidden rounded-lg border">
                    <img
                      src={c.imageUrl}
                      alt={`Case ${c.id}`}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{String(c.difficulty)}</Badge>
                    <Badge variant="outline">{c.site}</Badge>
                    {c.patientAge > 0 && (
                      <Badge variant="outline">{c.patientAge}y</Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link to={paths.app['case-attempt'].getHref(c.id)}>
                      {c.lastAttempt ? 'Review case' : 'Start case'}
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
