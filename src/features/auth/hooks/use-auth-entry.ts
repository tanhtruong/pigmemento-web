import type { MouseEvent } from 'react';

import { paths } from '@/config/paths';
import { isTokenValid } from '@/lib/auth';
import { gestureOrigin } from '@/lib/commit-origin';
import { useTransitionNavigate } from '@/components/motion/transition-conductor';
import { usePrefetchOnHoverFocus } from '@/hooks/use-prefetch-on-hover-focus';
import { prefetchLoginRoute } from '@/app/prefetch-routes';

/**
 * The shared gesture behind every amber CTA that exits the landing
 * (hero, CTA band, FAB, both ScrollRail LOG IN frames).
 *
 * Signed-out: intercepts the click and starts the conductor's `enter-auth`
 * bloom from the gesture origin. Signed-in: lets the plain <Link> navigate
 * to the dashboard (the #45 slice upgrades that path to a bloom).
 * Modifier-clicks and middle-clicks always fall through to the browser so
 * open-in-new-tab keeps working. Hover/focus warms the auth chunk so the
 * bloom never holds at apex on a cold import.
 *
 * Spread the result onto the existing Link:
 *   const entry = useAuthEntry();
 *   <Link to={entry.href} onClick={entry.onClick}
 *     onMouseEnter={entry.onMouseEnter} onFocus={entry.onFocus} />
 */
export type AuthEntryGesture = {
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter: () => void;
  onFocus: () => void;
};

export const useAuthEntry = (): AuthEntryGesture => {
  const startTransition = useTransitionNavigate();
  const prefetch = usePrefetchOnHoverFocus(prefetchLoginRoute);

  const href = isTokenValid()
    ? paths.app.dashboard.getHref()
    : paths.auth.login.getHref();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modified || event.button !== 0) return;
    // Token may have expired since render — decide at click time.
    if (isTokenValid()) return;
    event.preventDefault();
    startTransition({
      kind: 'enter-auth',
      origin: gestureOrigin(event),
      destination: paths.auth.login.getHref(),
    });
  };

  return { href, onClick, ...prefetch };
};
