import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';
import { ResolvedAttempt } from '@/features/cases/types/attempt-response.ts';

/**
 * Query options for a case's latest Attempt (#82, #122). Shared by the
 * `useCaseLatestAttempt` hook and any loader needing the resolved verdict, and
 * seeded by the submit mutation so a live answer renders with no refetch.
 */
export const latestAttemptQueryOptions = (caseId: string) =>
  queryOptions({
    queryKey: queryKeys['latest-attempt'](caseId),
    queryFn: async () => {
      const res = await api.get<ResolvedAttempt>(
        `/cases/${caseId}/attempts/latest`,
      );
      return res.data;
    },
  });

export const useCaseLatestAttempt = (
  caseId?: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    ...latestAttemptQueryOptions(caseId!),
    enabled: !!caseId && (options?.enabled ?? true),
  });
