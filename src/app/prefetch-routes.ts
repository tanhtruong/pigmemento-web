import {
  matchAppRoutePrefetchKey,
  type AppRoutePrefetchKey,
} from '@/lib/app-route-prefetch';

/**
 * Route-chunk warmers. Mirrors the lazy route table in `router.tsx` so
 * intent signals (hover, focus, auth-page mount) can load a destination's
 * chunk before the conductor's bloom needs it. Module-level consts keep
 * loader identity stable for the prefetch once-guard.
 */

export const prefetchLoginRoute = () => import('./routes/auth/login');

export const prefetchLandingRoute = () => import('./routes/landing');

const APP_CHUNKS: Record<AppRoutePrefetchKey, () => Promise<unknown>> = {
  dashboard: () => import('./routes/app/dashboard'),
  cases: () => import('./routes/app/cases/cases'),
  'case-random': () => import('./routes/app/cases/random-attempt'),
  'case-attempt': () => import('./routes/app/cases/case-attempt'),
  'case-drill': () => import('./routes/app/cases/case-drill'),
  profile: () => import('./routes/app/profile'),
};

/** Warm the app-shell chunk a destination path resolves to, if any. */
export const prefetchAppRoute = (destination: string): void => {
  const key = matchAppRoutePrefetchKey(destination);
  if (key) void APP_CHUNKS[key]();
};
