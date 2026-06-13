import {
  addDays,
  addWeeks,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';

import { cn } from '@/lib/utils';

type CalendarHeatmapProps = {
  /** Activity counts keyed by ISO date (YYYY-MM-DD). Missing = 0. */
  data: Record<string, number>;
  /** End date in ISO. Defaults to today. */
  endDateIso?: string;
  /** Number of week columns to render. Defaults to a rolling year (53). */
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

type HeatmapDay = { iso: string; value: number; date: Date; future: boolean };

/**
 * Calendar heatmap — a rolling-year GitHub shape, **amber fills not green**,
 * on a hairline grid. Reads as a journal, not a game.
 *
 * Columns are full Monday-anchored weeks (the user is Danish — weeks start
 * Monday) and the cells `flex` to fill the container width, so a year of
 * activity spans the dashboard instead of huddling in a corner. On a narrow
 * viewport the strip keeps a legible cell floor and scrolls horizontally rather
 * than collapsing to specks. Month labels ride above the column where each
 * month begins.
 */
export const CalendarHeatmap = ({
  data,
  endDateIso,
  weeks = 53,
  maxValue,
  className,
}: CalendarHeatmapProps) => {
  const end = startOfDay(endDateIso ? parseISO(endDateIso) : new Date());
  const lastWeekStart = startOfWeek(end, { weekStartsOn: 1 });
  const firstWeekStart = subWeeks(lastWeekStart, weeks - 1);
  const computedMax = maxValue ?? Math.max(1, ...Object.values(data));

  // Build columns of 7 days (Mon→Sun), oldest week on the left.
  const columns: HeatmapDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const colStart = addWeeks(firstWeekStart, w);
    const column: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(colStart, d);
      const iso = format(date, 'yyyy-MM-dd');
      column.push({
        iso,
        value: data[iso] ?? 0,
        date,
        future: isAfter(date, end),
      });
    }
    columns.push(column);
  }

  // A month label sits above the first column whose week opens a new month.
  const monthLabels = columns.map((col, w) => {
    const month = col[0].date.getMonth();
    const prev = w > 0 ? columns[w - 1][0].date.getMonth() : -1;
    return month !== prev ? format(col[0].date, 'MMM') : '';
  });

  return (
    <div
      data-slot="calendar-heatmap"
      className={cn('w-full overflow-x-auto', className)}
    >
      <div className="flex min-w-full flex-col gap-1.5">
        {/* Month labels — anchored to their column, free to overflow right. */}
        <div className="flex h-4 gap-[3px]">
          {monthLabels.map((label, w) => (
            <div key={w} className="relative min-w-[12px] flex-1">
              {label && (
                <span className="text-muted-foreground absolute left-0 font-mono text-[0.625rem] whitespace-nowrap">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Cells — one flex column per week, square cells that fill the width. */}
        <div
          className="flex gap-[3px]"
          role="grid"
          aria-label={`Activity over the last ${weeks} weeks`}
        >
          {columns.map((column, ci) => (
            <div
              key={ci}
              className="flex min-w-[12px] flex-1 flex-col gap-[3px]"
              role="row"
            >
              {column.map(({ iso, value, future }) =>
                future ? (
                  <div key={iso} className="aspect-square w-full" aria-hidden />
                ) : (
                  <div
                    key={iso}
                    role="gridcell"
                    aria-label={`${iso}: ${value} ${value === 1 ? 'case' : 'cases'}`}
                    className={cn(
                      'aspect-square w-full rounded-[2px] border border-hairline',
                      BUCKET_CLASSES[intensityBucket(value, computedMax)],
                    )}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
