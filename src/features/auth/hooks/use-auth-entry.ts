import type { MouseEvent } from 'react';

import { paths } from '@/config/paths';
import { isTokenValid } from '@/lib/auth';
import { gestureOrigin } from '@/lib/commit-origin';
import type { TransitionKind } from '@/lib/transition-conductor';
import { useTransitionNavigate } from '@/components/motion/transition-conductor';
import { usePrefetchOnHoverFocus } from '@/hooks/use-prefetch-on-hover-focus';
import { prefetchAppRoute, prefetchLoginRoute } from '@/app/prefetch-routes';

/**
 * The shared gesture behind every amber CTA that exits the landing
 * (hero, CTA band, FAB, both ScrollRail LOG IN frames).
 *
 * Signed-out: the conductor's `enter-auth` bloom into the auth panel.
 * Signed-in: the `enter-app` bloom straight to the dashboard — Tier 2
 * ceremony, the user-initiated re-entry earns the same gesture as a fresh
 * sign-in, skipping the panel (#45). Stale `/auth/login` bookmarks stay an
 * instant redirect; ceremony is for commit gestures only.
 * Modifier-clicks and middle-clicks always fall through to the browser so
 * open-in-new-tab keeps working. Hover/focus warms whichever chunk the
 * click would need.
 *
 * Spread the result onto the existing Link:
 *   const entry = useAuthEntry();
 *   <Link to={entry.href} onClick={entry.onClick}
 *     onMouseEnter={entry.onMouseEnter} onFocus={entry.onFocus} />
 */

/** Where a landing commit gesture goes, by auth state. Pure — tested. */
export const resolveAuthEntry = (
  loggedIn: boolean,
): { kind: TransitionKind; destination: string } =>
  loggedIn
    ? { kind: 'enter-app', destination: paths.app.dashboard.getHref() }
    : { kind: 'enter-auth', destination: paths.auth.login.getHref() };

/**
 * Module-level so every CTA shares one once-guard. Auth state is read at
 * hover time — a signed-in visitor warms the dashboard chunk, a signed-out
 * visitor warms the auth chunk.
 */
const prefetchEntryTarget = async () =>
  isTokenValid()
    ? prefetchAppRoute(paths.app.dashboard.getHref())
    : prefetchLoginRoute();

export type AuthEntryGesture = {
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter: () => void;
  onFocus: () => void;
};

export const useAuthEntry = (): AuthEntryGesture => {
  const startTransition = useTransitionNavigate();
  const prefetch = usePrefetchOnHoverFocus(prefetchEntryTarget);

  const { destination: href } = resolveAuthEntry(isTokenValid());

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modified || event.button !== 0) return;
    // Token may have expired since render — decide at click time.
    const entry = resolveAuthEntry(isTokenValid());
    event.preventDefault();
    startTransition({
      kind: entry.kind,
      origin: gestureOrigin(event),
      destination: entry.destination,
    });
  };

  return { href, onClick, ...prefetch };
};
