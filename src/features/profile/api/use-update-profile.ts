import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { UpdateUserRequest, User } from '@/features/profile/types/user.ts';
import { queryKeys } from '@/lib/query-keys.ts';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedUser: UpdateUserRequest) => {
      const res = await api.patch<User>('/me', updatedUser);
      return res.data;
    },
    onMutate: async (updatedUser) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.me });

      // Snapshot the previous value
      const previousMe = queryClient.getQueryData<User>(queryKeys.me);

      // Optimistically update the cache
      if (previousMe) {
        queryClient.setQueryData<User>(queryKeys.me, {
          ...previousMe,
          ...updatedUser,
        });
      }

      // Return context for rollback
      return { previousMe };
    },

    onError: (_err, _updatedUser, context) => {
      // Roll back to previous value if mutation fails
      if (context?.previousMe) {
        queryClient.setQueryData(queryKeys.me, context.previousMe);
      }
    },

    onSettled: () => {
      // Ensure server state is authoritative
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
};
