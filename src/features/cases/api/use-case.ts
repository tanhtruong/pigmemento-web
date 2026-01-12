import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';
import { CaseDetail } from '@/features/cases/types/case-detail.ts';

export const useCase = (caseId: string) => {
  return useQuery({
    queryKey: queryKeys.case(caseId),
    queryFn: async () => {
      const res = await api.get<CaseDetail>(`/cases/${caseId}`);
      return res.data;
    },
  });
};
