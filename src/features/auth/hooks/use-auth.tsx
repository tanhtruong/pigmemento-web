import { paths } from '@/config/paths';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { AuthResponse, LoginDto, RegisterPayload } from '../types/auth';
import api from '@/lib/axios';

/**
 * Login + register mutations.
 *
 * Both return the React-Query mutation as-is and do NOT navigate on
 * success — the caller decides what to do with the authenticated state.
 * The AuthLayout uses this to fire its dark→light fade-through before
 * actually routing to the app shell.
 *
 * Callers that just want the legacy behaviour can read the redirect
 * target from `useAuthRedirectTarget()` and navigate themselves.
 */

export const useAuthRedirectTarget = (): string => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  return redirectTo && redirectTo.startsWith('/')
    ? redirectTo
    : paths.app.dashboard.getHref();
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      return res.data;
    },
    onSuccess: () => {
      toast('Welcome back!', { closeButton: true });
    },
    onError: (err) => {
      console.error('Login failed', err);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      return res.data;
    },
    onSuccess: () => {
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
