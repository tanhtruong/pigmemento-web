import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { CaseListItem } from '@/features/cases/types/case-list-item.ts';
import { queryKeys } from '@/lib/query-keys.ts';

/** Query options for the case library (#122) — shared by the hook and any loader. */
export const casesQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.cases,
    queryFn: async () => {
      const res = await api.get<CaseListItem[]>(`/cases`);
      return res.data;
    },
  });

export const useCases = () => useQuery(casesQueryOptions());
