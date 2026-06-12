/**
 * Maps an app-shell destination path to the lazy-route chunk that renders
 * it. Pure matcher — the import() thunks live in `app/prefetch-app-route.ts`
 * next to the route table they mirror.
 */

export type AppRoutePrefetchKey =
  | 'dashboard'
  | 'cases'
  | 'case-random'
  | 'case-attempt'
  | 'case-review'
  | 'case-drill'
  | 'profile';

const EXACT: Record<string, AppRoutePrefetchKey> = {
  '/app/dashboard': 'dashboard',
  '/app/cases': 'cases',
  '/app/cases/random/attempt': 'case-random',
  '/app/cases/drill': 'case-drill',
  '/app/profile': 'profile',
};

const CASE_ATTEMPT = /^\/app\/cases\/[^/]+\/attempt$/;
const CASE_REVIEW = /^\/app\/cases\/[^/]+\/review$/;

export const matchAppRoutePrefetchKey = (
  destination: string,
): AppRoutePrefetchKey | null => {
  const path = destination.split('?')[0];
  if (EXACT[path]) return EXACT[path];
  if (CASE_ATTEMPT.test(path)) return 'case-attempt';
  if (CASE_REVIEW.test(path)) return 'case-review';
  return null;
};
