import { useQuery } from '@tanstack/react-query';
import { User } from '@/features/profile/types/user.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import api from '@/lib/axios.ts';

export const useProfile = () => {
  return useQuery<User>({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const res = await api.get<User>('/me');
      return res.data;
    },
  });
};
