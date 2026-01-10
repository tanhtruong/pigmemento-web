import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';
import { CaseDetail } from '@/features/cases/types/case-detail.ts';

export const useRandomCase = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys['random-case'],
    queryFn: async () => {
      const res = await api.get<CaseDetail>('/cases/random');
      return res.data;
    },
    enabled,
  });
};
