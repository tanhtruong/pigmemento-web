import { paths } from '@/config/paths';
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthResponse, LoginDto, RegisterPayload } from '../types/auth';
import api from '@/lib/axios';
import { setToken, clearToken } from '@/lib/session';

/**
 * Login + register mutations.
 *
 * Both return the React-Query mutation as-is and do NOT navigate or toast
 * on success — the caller decides what to do with the authenticated state.
 * The auth forms start the TransitionConductor's amber bloom-to-light;
 * the bloom IS the welcome, so no success toast competes with it.
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
      setToken(res.data.token);
      return res.data;
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
      setToken(res.data.token);
      return res.data;
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
    performLogout(queryClient);
    navigate(paths.home.getHref(), { replace: true });
  };

  return logout;
};

/**
 * Session teardown only — token + query cache. Deliberately does NOT
 * navigate or toast: the caller owns the exit (the avatar menu drives the
 * conductor's exit-app bloom; the bloom is the goodbye).
 */
export const performLogout = (queryClient: QueryClient): void => {
  clearToken();
  queryClient.clear();
};
