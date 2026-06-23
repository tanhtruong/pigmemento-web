import type { QueryClient } from '@tanstack/react-query';

import { clearToken } from '@/lib/session';
import { clearScrollMemory } from '@/lib/route-scroll';

/**
 * End the authenticated Session — the one place a Session is torn down. Clears
 * the token (which reactively flips `useSession` to unauthenticated, so guarded
 * routes bounce to login), the scroll-restoration store, and the React Query
 * cache, so the next sign-in starts clean. Deliberately does NOT navigate or
 * toast: the caller owns the exit (an avatar-menu bloom, a redirect, the 401
 * interceptor).
 */
export const endSession = (queryClient: QueryClient): void => {
  clearToken();
  clearScrollMemory();
  queryClient.clear();
};
