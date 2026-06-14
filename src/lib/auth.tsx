import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { paths } from '@/config/paths';
import { useSession } from '@/lib/use-session';

/**
 * Guards the /app/* surfaces (#122). Reads the reactive Session, so a logout —
 * here, in the avatar menu, or in another tab — bounces to login live, rather
 * than waiting for a refresh. The check is synchronous (no token decode in an
 * effect), so an authenticated visitor never sees a loading flash.
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { status } = useSession();

  if (status !== 'authenticated') {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
};
