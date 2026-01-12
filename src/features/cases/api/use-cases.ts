import api from '@/lib/axios.ts';
import { CaseListItem } from '@/features/cases/types/case-list-item.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { useQuery } from '@tanstack/react-query';

export const useCases = () => {
  return useQuery({
    queryKey: queryKeys.cases,
    queryFn: async () => {
      const res = await api.get<CaseListItem[]>(`/cases`);
      return res.data;
    },
  });
};
