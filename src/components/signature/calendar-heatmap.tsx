import { cn } from '@/lib/utils';

type CalendarHeatmapProps = {
  /** Activity counts keyed by ISO date (YYYY-MM-DD). Missing = 0. */
  data: Record<string, number>;
  /** End date in ISO. Defaults to the latest day in `data`. */
  endDateIso?: string;
  /** Number of weeks to render. */
  weeks?: number;
  /** Maximum value used to scale intensity buckets. Defaults to max in data. */
  maxValue?: number;
  className?: string;
};

const BUCKET_CLASSES = [
  'bg-muted/40',
  'bg-primary/15',
  'bg-primary/35',
  'bg-primary/60',
  'bg-primary',
];

const intensityBucket = (value: number, max: number): number => {
  if (value <= 0 || max <= 0) return 0;
  const ratio = value / max;
  if (ratio >= 0.85) return 4;
  if (ratio >= 0.55) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
};

const isoForOffset = (endIso: string, daysBack: number): string => {
  const end = new Date(endIso + 'T00:00:00Z');
  end.setUTCDate(end.getUTCDate() - daysBack);
  return end.toISOString().slice(0, 10);
};

/**
 * Calendar heatmap — 12-week GitHub shape, **amber fills not green**,
 * hairline grid. Reads journal, not gamified.
 *
 * PR9 wires the popover-on-tap-square interaction. For PR1, the grid is the
 * contract.
 */
export const CalendarHeatmap = ({
  data,
  endDateIso,
  weeks = 12,
  maxValue,
  className,
}: CalendarHeatmapProps) => {
  const keys = Object.keys(data);
  let latest = endDateIso;
  if (!latest) {
    if (keys.length) {
      const sorted = keys.sort();
      latest = sorted[sorted.length - 1];
    } else {
      latest = '2026-06-11';
    }
  }
  const totalDays = weeks * 7;
  const computedMax = maxValue ?? Math.max(1, ...Object.values(data), 0);

  // Build columns of 7 days, most-recent on the right.
  const columns: { iso: string; value: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: { iso: string; value: number }[] = [];
    for (let d = 6; d >= 0; d--) {
      const offset = (weeks - 1 - w) * 7 + (6 - d);
      const iso = isoForOffset(latest, totalDays - 1 - offset);
      column.push({ iso, value: data[iso] ?? 0 });
    }
    columns.push(column);
  }

  return (
    <div
      data-slot="calendar-heatmap"
      className={cn('flex gap-[3px]', className)}
      role="grid"
      aria-label={`Activity over the last ${weeks} weeks`}
    >
      {columns.map((column, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]" role="row">
          {column.map(({ iso, value }) => {
            const bucket = intensityBucket(value, computedMax);
            return (
              <div
                key={iso}
                role="gridcell"
                aria-label={`${iso}: ${value} cases`}
                className={cn(
                  'h-3 w-3 rounded-[2px] border border-hairline',
                  BUCKET_CLASSES[bucket],
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
