import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';
import { CaseDetail } from '@/features/cases/types/case-detail.ts';

/**
 * Query options for a single case (#60). Shared by the `useCase` hook and the
 * route's `clientLoader`, so a navigation can `ensureQueryData` the case before
 * the attempt surface mounts — cached cases reveal with no spinner.
 */
export const caseQueryOptions = (caseId: string) =>
  queryOptions({
    queryKey: queryKeys.case(caseId),
    queryFn: async () => {
      const res = await api.get<CaseDetail>(`/cases/${caseId}`);
      return res.data;
    },
  });

export const useCase = (caseId: string) => useQuery(caseQueryOptions(caseId));
