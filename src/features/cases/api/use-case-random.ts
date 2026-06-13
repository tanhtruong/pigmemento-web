import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';
import { CaseDetail } from '@/features/cases/types/case-detail.ts';

/**
 * Query options for a random case (#60). Shared by the `useRandomCase` hook
 * and the random-attempt route's `clientLoader` so the surface can prefetch
 * before mounting.
 */
export const randomCaseQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys['random-case'],
    queryFn: async () => {
      const res = await api.get<CaseDetail>('/cases/random');
      return res.data;
    },
  });

export const useRandomCase = (enabled: boolean = true) =>
  useQuery({ ...randomCaseQueryOptions(), enabled });
