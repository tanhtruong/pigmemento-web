import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Hairline } from '@/components/foundation/hairline';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/config/paths';
import type { CaseListItem } from '@/features/cases/types/case-list-item.ts';
import { useCases } from '@/features/cases/api/use-cases.ts';
import { shortCaseId } from '@/features/cases/lib/case-id.ts';
import { captureLesionFlight } from '@/lib/lesion-flight';
import { cn } from '@/lib/utils';

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';
type Attempted = 'all' | 'attempted' | 'unattempted';
type Sort = 'recommended' | 'newest' | 'difficulty' | 'id';

const safeLower = (v: string) => v.trim().toLowerCase();

const formatAttemptMeta = (c: CaseListItem) => {
  if (!c.lastAttempt) {
    return {
      label: 'Not attempted',
      when: null as string | null,
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

  return {
    label: c.lastAttempt.correct ? 'Correct' : 'Incorrect',
    when,
    attempted: true,
    correct: Boolean(c.lastAttempt.correct),
  };
};

const CasesScene = () => {
  const { data: cases = [], isLoading, isError } = useCases();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [attempted, setAttempted] = useState<Attempted>('all');
  const [sort, setSort] = useState<Sort>('recommended');

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
      .filter((c) =>
        difficulty === 'all' ? true : String(c.difficulty) === difficulty,
      )
      .filter((c) => {
        if (attempted === 'all') return true;
        return attempted === 'attempted'
          ? Boolean(c.lastAttempt)
          : !c.lastAttempt;
      })
      .filter((c) => {
        if (!q) return true;
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

  const filtersActive =
    query ||
    difficulty !== 'all' ||
    attempted !== 'all' ||
    sort !== 'recommended';

  const clearFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setDifficulty('all');
    setAttempted('all');
    setSort('recommended');
  };

  return (
    <article className="flex flex-col gap-8 py-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-primary font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Library
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Every case, browsable.
          </h1>
          <p className="text-muted-foreground text-sm">
            {cases.length > 0
              ? `${cases.length} curated dermoscopic cases from the ISIC archive.`
              : 'Curated dermoscopic cases from the ISIC archive.'}
          </p>
        </div>
      </header>

      <Hairline />

      {/* Search + sort */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search case ID, site, or age…"
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
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
        </div>

        {/* Filter chips */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
          <FilterRow label="Difficulty">
            {(['all', 'easy', 'medium', 'hard'] as const).map((v) => (
              <FilterChip
                key={v}
                active={difficulty === v}
                onClick={() => setDifficulty(v)}
                label={
                  v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)
                }
              />
            ))}
          </FilterRow>
          <FilterRow label="Status">
            {(['all', 'unattempted', 'attempted'] as const).map((v) => (
              <FilterChip
                key={v}
                active={attempted === v}
                onClick={() => setAttempted(v)}
                label={
                  v === 'all'
                    ? 'All'
                    : v === 'unattempted'
                      ? 'Unattempted'
                      : 'Attempted'
                }
              />
            ))}
          </FilterRow>

          {filtersActive && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="self-start sm:ml-auto"
            >
              <X />
              Clear filters
            </Button>
          )}
        </div>

        <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-wider uppercase">
          Showing <span className="text-foreground">{filtered.length}</span> of{' '}
          <span className="text-foreground">{cases.length}</span>
        </p>
      </section>

      {/* Grid */}
      <section className="flex-1">
        {isLoading ? (
          <CaseGridSkeleton />
        ) : isError ? (
          <CaseEmpty
            title="Couldn’t load the library."
            description="The case archive isn’t responding. Try again in a moment."
            cta={
              <Button asChild>
                <Link to={paths.app.dashboard.getHref()}>Back to Progress</Link>
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <CaseEmpty
            title={
              filtersActive
                ? 'Nothing matches that filter.'
                : 'Your library is empty.'
            }
            description={
              filtersActive
                ? 'Try widening the difficulty or status filters.'
                : 'Start your first case to populate your library.'
            }
            cta={
              filtersActive ? (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild>
                  <Link to={paths.app['case-random'].getHref()}>
                    Start your first case
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CaseCard key={c.id} item={c} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
};

export default CasesScene;

/* ────────────────────────────────────────────────────────────────────────── */

const FilterRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-muted-foreground font-mono text-[0.65rem] tracking-wider uppercase">
      {label}
    </span>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

const FilterChip = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'border-hairline rounded-full border px-2.5 py-0.5 text-xs',
      'transition-colors ease-considered duration-150',
      active
        ? 'bg-primary text-primary-foreground border-primary'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
    )}
  >
    {label}
  </button>
);

const CaseCard = ({ item }: { item: CaseListItem }) => {
  const meta = formatAttemptMeta(item);
  return (
    <Link
      to={paths.app['case-attempt'].getHref(item.id)}
      onClick={(event) =>
        captureLesionFlight(event.currentTarget, item.id, item.imageUrl)
      }
      className={cn(
        'group/case-card border-hairline relative isolate flex flex-col overflow-hidden rounded-card border bg-card',
        'shadow-warm-sm transition-all ease-considered duration-200',
        'hover:shadow-warm hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <div
        data-case-thumb
        className="bg-muted/40 aspect-square w-full overflow-hidden"
      >
        <img
          src={item.imageUrl}
          alt={`Case ${item.id}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/case-card:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground font-mono text-xs tabular-nums">
            CASE · {shortCaseId(item.id)}
          </span>
          {meta.attempted ? (
            <Badge
              variant={meta.correct ? 'correct' : 'incorrect'}
              className="text-[0.65rem]"
            >
              {meta.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[0.65rem]">
              New
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="mono">{String(item.difficulty)}</Badge>
          <Badge variant="fact">{item.site}</Badge>
          {item.patientAge > 0 && (
            <Badge variant="fact">{item.patientAge}y</Badge>
          )}
        </div>

        {meta.when && (
          <p className="text-muted-foreground text-[0.65rem]">
            Last attempted {meta.when}
          </p>
        )}
      </div>
    </Link>
  );
};

const CaseGridSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="border-hairline overflow-hidden rounded-card border bg-card"
      >
        <Skeleton className="aspect-square w-full rounded-none border-0" />
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    ))}
  </div>
);

const CaseEmpty = ({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: React.ReactNode;
}) => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
    <h2 className="font-display text-3xl">{title}</h2>
    <p className="text-muted-foreground text-sm">{description}</p>
    {cta}
  </div>
);
