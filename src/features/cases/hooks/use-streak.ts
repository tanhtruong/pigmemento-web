import { useMemo } from 'react';

import { useCaseHistory } from '@/features/cases/api/use-case-history.ts';

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Daily-attempt streak derived from useCaseHistory.
 *
 * Server truth would be nicer, but until that's exposed we compute it from
 * the same history payload the Library/Progress already use — same React
 * Query cache, no extra request.
 */
export const useStreak = (): number => {
  const { data: caseHistory = [] } = useCaseHistory();

  return useMemo(() => {
    const uniqueDays = Array.from(
      new Set(
        caseHistory
          .map((c) => c.lastAttempt?.createdAt)
          .filter((v): v is string => Boolean(v))
          .map((iso) => startOfDay(new Date(iso))),
      ),
    ).sort((a, b) => b - a);

    if (uniqueDays.length === 0) return 0;

    const today = startOfDay(new Date());
    let streak = 0;
    for (let i = 0; i < uniqueDays.length; i += 1) {
      const expected = today - streak * 86_400_000;
      if (uniqueDays[i] === expected) streak += 1;
      else break;
    }
    return streak;
  }, [caseHistory]);
};
