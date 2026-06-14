import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Outlet, useLocation, useNavigation } from 'react-router';

import { PENDING_HOLD_MS } from '@/lib/motion-tokens';
import {
  classifyRouteTransition,
  shouldAnimateRouteTransition,
} from '@/lib/route-transition';
import {
  rememberScroll,
  restoresScroll,
  scrollTargetFor,
} from '@/lib/route-scroll';
import { cn } from '@/lib/utils';

/**
 * Grammar-aware scroll restoration for the View Transitions engine (#63, #102).
 *
 * The outgoing scroll is saved, then the incoming surface is positioned:
 * back / ascend return to where you were, everything else starts at the top.
 * Both happen in a layout effect so that, when React Router drives the swap
 * inside `document.startViewTransition` (its `flushSync` commit), the *new*
 * snapshot is captured at the destination scroll and the crossfade never jumps.
 * It runs for instant cuts too, so reduced-motion / unsupported browsers
 * restore scroll exactly the same.
 */
const useRouteScrollRestoration = (pathname: string): void => {
  const previous = useRef(pathname);

  useLayoutEffect(() => {
    const from = previous.current;
    if (from === pathname) return;
    rememberScroll(from, window.scrollY);
    const variant = classifyRouteTransition(from, pathname);
    window.scrollTo(0, scrollTargetFor(pathname, restoresScroll(variant)));
    previous.current = pathname;
  }, [pathname]);
};

/**
 * Pending fix-out dim (#54), re-homed off the old motion engine (#102). While a
 * route loader holds the navigation past PENDING_HOLD_MS, the outgoing surface
 * eases to the held fix — the click acknowledged without a spinner. Resolves
 * under the threshold (the react-query cached majority) never trigger it, and
 * reduced motion opts out entirely (parity with the old engine).
 */
const usePendingHold = (currentPath: string): boolean => {
  const navigation = useNavigation();
  const reducedMotion = useReducedMotion() ?? false;
  const [held, setHeld] = useState(false);

  const pendingPath =
    !reducedMotion &&
    navigation.state === 'loading' &&
    navigation.location &&
    shouldAnimateRouteTransition(currentPath, navigation.location.pathname)
      ? navigation.location.pathname
      : undefined;

  useEffect(() => {
    if (pendingPath === undefined) {
      setHeld(false);
      return;
    }
    const timer = window.setTimeout(() => setHeld(true), PENDING_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [pendingPath]);

  return held;
};

/**
 * AppRouteOutlet — the in-app route surface (#102).
 *
 * The route swap itself is animated by the browser's View Transitions API,
 * armed per hop by AppTabLink; this outlet owns the two behaviours that outlive
 * any single animation engine: grammar-aware scroll restoration and the pending
 * fix-out dim. No motion/react renders here — unsupported browsers and
 * reduced-motion simply cut instantly, while the dim and scroll still hold.
 */
export const AppRouteOutlet = () => {
  const { pathname } = useLocation();
  useRouteScrollRestoration(pathname);
  const held = usePendingHold(pathname);

  return (
    <div
      data-app-route-surface
      data-pending={held ? 'true' : 'false'}
      className={cn(
        'transition-opacity ease-considered duration-[420ms]',
        'data-[pending=true]:opacity-[0.82]',
      )}
    >
      <Outlet />
    </div>
  );
};
