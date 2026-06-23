import { env } from '@/config/env';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { getToken } from '@/lib/session';
import { endSession } from '@/lib/end-session';
import { queryClient } from '@/lib/react-query';

const api = axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on the login/register forms means bad credentials (the form owns it),
// not a dead Session — never sign the user out for those.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

/**
 * Whether a failed request means "this Session is dead, sign out": a 401 (not a
 * 403 — authenticated-but-forbidden) on a non-auth endpoint, while a token is
 * actually present. Exported so the decision can be tested in isolation.
 */
export const isSessionEndingAuthError = (error: unknown): boolean => {
  if (!isAxiosError(error) || error.response?.status !== 401) return false;
  const url = error.config?.url ?? '';
  if (AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))) return false;
  return Boolean(getToken());
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isSessionEndingAuthError(error)) {
      // End the Session; clearing the token reactively flips useSession, so
      // ProtectedRoute bounces to login (with redirectTo) on its own.
      endSession(queryClient);
      toast('Session expired — please sign in again');
    }
    return Promise.reject(error);
  },
);

export default api;
