export type Milestone = 'week-1' | 'first-week' | 'two-weeks' | 'one-month';

const THRESHOLDS: Array<{ days: number; milestone: Milestone }> = [
  { days: 30, milestone: 'one-month' },
  { days: 14, milestone: 'two-weeks' },
  { days: 7, milestone: 'first-week' },
  { days: 3, milestone: 'week-1' },
];

export const milestoneFor = (streak: number): Milestone | null => {
  for (const { days, milestone } of THRESHOLDS) {
    if (streak >= days) return milestone;
  }
  return null;
};

export const shouldFireMilestoneCelebration = (
  current: number,
  previousSeen: number | undefined,
): boolean => {
  if (previousSeen === undefined) return false;
  return milestoneFor(current) !== milestoneFor(previousSeen);
};

const MILESTONE_LABELS: Record<Milestone, string> = {
  'week-1': 'Week 1',
  'first-week': 'First week',
  'two-weeks': 'Two weeks',
  'one-month': 'One month',
};

export const milestoneLabel = (m: Milestone): string => MILESTONE_LABELS[m];
