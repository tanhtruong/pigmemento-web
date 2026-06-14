import { Stats } from '@/features/profile/types/stats.ts';
import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';

/** Query options for the signed-in user's Stats (#122) — shared by the hook and any loader. */
export const statsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys['me-stats'],
    queryFn: async () => {
      const res = await api.get<Stats>('/me/progress');
      return res.data;
    },
  });

export const useStats = () => useQuery(statsQueryOptions());
