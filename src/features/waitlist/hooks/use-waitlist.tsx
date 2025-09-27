import { useMutation } from '@tanstack/react-query';
import { WaitlistDto } from '../types/waitlist';
import api from '@/lib/axios';

export const useWaitlist = () => {
  return useMutation({
    mutationFn: async (data: WaitlistDto) => {
      const res = await api.post('/waitlist', data);
      return res.data;
    },
    onError: (err) => {
      console.error('Registration failed', err);
    },
  });
};
