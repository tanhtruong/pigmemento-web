import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios.ts';
import { clearAuthToken } from '@/lib/auth';
import { toast } from 'sonner';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete('/me');
    },
    onSuccess: () => {
      // Clear auth + cached data after account deletion
      clearAuthToken();
      queryClient.clear();
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
