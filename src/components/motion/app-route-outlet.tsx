import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Outlet, useLocation, useNavigation } from 'react-router';

import { PENDING_HOLD_MS } from '@/lib/motion-tokens';
import { shouldAnimateRouteTransition } from '@/lib/route-transition';
import { rememberScroll, scrollTargetFor } from '@/lib/route-scroll';
import { planInAppTransition } from '@/lib/plan-in-app-transition';
import { supportsViewTransitions } from '@/lib/view-transitions';
import { cn } from '@/lib/utils';

/**
 * Per-hop choreography for the View Transitions engine (#63, #102, #103).
 *
 * One `planInAppTransition` decision drives two things, both inside a layout
 * effect so they land in React Router's `flushSync` commit — the window between
 * the old and new `document.startViewTransition` snapshots:
 *
 *  - Scroll restoration (#63): save the outgoing scroll, then place the
 *    incoming surface — back / ascend return to where you were, everything else
 *    starts at the top. Running here means the *new* snapshot is captured at the
 *    destination scroll, so the crossfade never jumps. It runs for instant cuts
 *    too, so reduced-motion / unsupported browsers restore scroll identically.
 *  - Develop conjugation (#103): set `data-vt` on <html> so the directional
 *    `::view-transition` keyframes are chosen before the pseudo-elements are
 *    styled. Every animated hop sets it here, so a stale value is never
 *    consumed; an instant cut clears it to keep the DOM honest.
 */
const useInAppHopChoreography = (
  pathname: string,
  reducedMotion: boolean,
): void => {
  const previous = useRef(pathname);

  useLayoutEffect(() => {
    const from = previous.current;
    if (from === pathname) return;

    const plan = planInAppTransition({
      from,
      to: pathname,
      reducedMotion,
      supportsVT: supportsViewTransitions(),
    });

    rememberScroll(from, window.scrollY);
    window.scrollTo(0, scrollTargetFor(pathname, plan.restoreScroll));

    const root = document.documentElement;
    if (plan.mode === 'view-transition') {
      root.dataset.vt = plan.variant;
    } else {
      delete root.dataset.vt;
    }

    previous.current = pathname;
  }, [pathname, reducedMotion]);
};

/**
 * Pending fix-out dim (#54), re-homed off the old motion engine (#102). While a
 * route loader holds the navigation past PENDING_HOLD_MS, the outgoing surface
 * eases to the held fix — the click acknowledged without a spinner. Resolves
 * under the threshold (the react-query cached majority) never trigger it, and
 * reduced motion opts out entirely (parity with the old engine).
 */
const usePendingHold = (
  currentPath: string,
  reducedMotion: boolean,
): boolean => {
  const navigation = useNavigation();
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- releases the pending-hold when navigation settles; its paired set is driven by the timer below
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
  const reducedMotion = useReducedMotion() ?? false;
  useInAppHopChoreography(pathname, reducedMotion);
  const held = usePendingHold(pathname, reducedMotion);

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
