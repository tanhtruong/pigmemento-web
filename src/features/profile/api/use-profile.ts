import { queryOptions, useQuery } from '@tanstack/react-query';
import { User } from '@/features/profile/types/user.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';

/** Query options for the signed-in Profile (#122) — shared by the hook and any loader. */
export const profileQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const res = await api.get<User>('/me');
      return res.data;
    },
  });

export const useProfile = () => useQuery(profileQueryOptions());
