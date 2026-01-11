import { Stats } from '@/features/profile/types/stats.ts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';

export const useStats = () => {
  return useQuery<Stats>({
    queryKey: queryKeys['me-stats'],
    queryFn: async () => {
      const res = await api.get<Stats>('/me/progress');
      return res.data;
    },
  });
};
