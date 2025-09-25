import { paths } from '@/config/paths';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { AuthResponse, LoginDto, RegisterPayload } from '../types/auth';
import api from '@/lib/axios';

export const useLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      return res.data;
    },
    onSuccess: () => {
      navigate(
        `${redirectTo ? `${redirectTo}` : paths.app.dashboard.getHref()}`,
        {
          replace: true,
        },
      );
      toast('Welcome back!', { closeButton: true });
    },
    onError: (err) => {
      console.error('Login failed', err);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      console.log(res.data);
      localStorage.setItem('token', res.data.token);
      return res.data;
    },
    onSuccess: () => {
      navigate(
        `${redirectTo ? `${redirectTo}` : paths.app.dashboard.getHref()}`,
        {
          replace: true,
        },
      );
      toast('Welcome!', { closeButton: true });
    },
    onError: (err) => {
      console.error('Registration failed', err);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    toast('You have been logged out', { closeButton: true });
    navigate(paths.auth.login.getHref(), { replace: true });
    return;
  };

  return logout;
};
