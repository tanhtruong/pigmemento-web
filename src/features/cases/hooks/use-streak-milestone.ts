import { useEffect, useState } from 'react';

import {
  milestoneFor,
  shouldFireMilestoneCelebration,
  type Milestone,
} from '@/utils/streak-milestone';

const STORAGE_KEY = 'pigmemento.streakMilestone.lastSeen';
const CELEBRATION_MS = 2000;

const readPreviousSeen = (): number | undefined => {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const writeSeen = (value: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, String(value));
};

export const useStreakMilestone = (
  currentStreak: number,
): { milestone: Milestone | null; isCelebrating: boolean } => {
  const [isCelebrating, setIsCelebrating] = useState(() =>
    shouldFireMilestoneCelebration(currentStreak, readPreviousSeen()),
  );

  useEffect(() => {
    writeSeen(currentStreak);
  }, [currentStreak]);

  useEffect(() => {
    if (!isCelebrating) return;
    const t = window.setTimeout(() => setIsCelebrating(false), CELEBRATION_MS);
    return () => window.clearTimeout(t);
  }, [isCelebrating]);

  return {
    milestone: milestoneFor(currentStreak),
    isCelebrating,
  };
};
