import { Hairline } from '@/components/foundation/hairline';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * CaseAttemptSkeleton — the "latent print" (#60).
 *
 * A layout-accurate placeholder for CaseStage: the same header, hairline, and
 * [1.35fr_1fr] grid with a 4:5 hero, so when the case data lands the real
 * content develops into the exact same coordinates — no spinner, no layout
 * shift. Shown only on a cold fetch (a cache miss past the loader's prefetch
 * cap); cached cases skip it entirely.
 */
export const CaseAttemptSkeleton = () => (
  <div
    className="flex flex-col gap-8 text-left md:py-2"
    aria-busy="true"
    aria-label="Loading case"
  >
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>
      <Skeleton className="h-8 w-20" />
    </header>

    <Hairline />

    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <div className="lg:sticky lg:top-20 lg:self-start">
        <Skeleton className="rounded-card aspect-[4/5] w-full" />
      </div>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </section>

        <Hairline />

        <section className="flex flex-col gap-3">
          <Skeleton className="h-3 w-40" />
          <div className="flex flex-col gap-2">
            <Skeleton className="rounded-card h-14 w-full" />
            <Skeleton className="rounded-card h-14 w-full" />
            <Skeleton className="rounded-card h-14 w-full" />
          </div>
        </section>
      </div>
    </div>
  </div>
);
