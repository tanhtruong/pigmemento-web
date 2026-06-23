import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { endSession } from '@/lib/end-session';
import { toast } from 'sonner';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete('/me');
    },
    onSuccess: () => {
      // Tear the session down (token, scroll, cache) after deletion.
      endSession(queryClient);
      toast('Account deleted', {
        description:
          'Your account and all associated data have been permanently removed',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete account', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    },
  });
};
