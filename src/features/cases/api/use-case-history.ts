import { queryKeys } from '@/lib/query-keys.ts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { CaseListItem } from '@/features/cases/types/case-list-item.ts';

export const useCaseHistory = () => {
  return useQuery({
    queryKey: queryKeys['attempted-cases'],
    queryFn: async () => {
      const res = await api.get<CaseListItem[]>('/cases/attempted');
      return res.data;
    },
  });
};
