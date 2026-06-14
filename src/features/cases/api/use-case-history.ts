import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';
import { CaseListItem } from '@/features/cases/types/case-list-item.ts';

/** Query options for attempted cases (#122) — shared by the hook and any loader. */
export const caseHistoryQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys['attempted-cases'],
    queryFn: async () => {
      const res = await api.get<CaseListItem[]>('/cases/attempted');
      return res.data;
    },
  });

export const useCaseHistory = () => useQuery(caseHistoryQueryOptions());
