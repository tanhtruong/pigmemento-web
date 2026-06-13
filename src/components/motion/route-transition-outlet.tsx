import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation, useNavigation } from 'react-router';

import { developVariants, PENDING_HOLD_MS } from '@/lib/motion-tokens';
import {
  classifyRouteTransition,
  shouldAnimateRouteTransition,
  type RouteTransitionVariant,
} from '@/lib/route-transition';
import {
  rememberScroll,
  restoresScroll,
  scrollTargetFor,
} from '@/lib/route-scroll';

/**
 * RouteTransitionOutlet — speaks the in-app transition grammar (#53, #59, #73).
 *
 * Every hop between app surfaces plays the Develop, conjugated by the
 * relationship between the two routes (lateral / descend / ascend / advance,
 * classified in `lib/route-transition`). Surfaces move on the compositor only
 * (opacity + transform via `developVariants`) — no whole-tree filter.
 *
 * Every hop is the same quiet dissolve: `mode="wait"` swaps the surface while
 * the incoming one enters from an opacity floor (not full transparency), so
 * there is no blank frame between them. (popLayout would overlap them for a
 * true crossfade, but left a stuck exited layer in this route tree, so we stay
 * on robust `wait` + floor — see motion-tokens.) #73 removed the amber
 * DevelopWash that used to cover descend/advance into case-flow — entering a
 * case now dissolves like every other hop, no in-your-face bloom.
 *
 * The hop's variant is LATCHED per pathname change (state adjusted during
 * render), never recomputed from the live location: re-renders that land
 * while the exit is still playing must not downgrade the pending hop to
 * `none`.
 *
 * `custom` is set on both the presence and the child: AnimatePresence
 * re-renders exiting children with its own `custom`, which is how the
 * outgoing surface fixes with the *current* hop's drift.
 */

type LatchedHop = {
  path: string;
  variant: RouteTransitionVariant;
  /** Back/ascend hop — restore the destination's saved scroll instead of top (#63). */
  restoreScroll: boolean;
};

/**
 * Pending fix-out dim (#54). While a route loader holds navigation past
 * PENDING_HOLD_MS, the still-mounted outgoing surface eases into the held
 * fix — the click acknowledged without a spinner. Resolves under the
 * threshold (the react-query cached majority) never trigger it, and hops
 * whose grammar is `none` never dim.
 */
const usePendingHold = (currentPath: string): boolean => {
  const navigation = useNavigation();
  const [held, setHeld] = useState(false);

  const pendingPath =
    navigation.state === 'loading' &&
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

export const RouteTransitionOutlet = () => {
  const reducedMotion = useReducedMotion();
  const location = useLocation();
  const held = usePendingHold(location.pathname);

  const [latched, setLatched] = useState<LatchedHop>({
    path: location.pathname,
    variant: 'none',
    restoreScroll: false,
  });
  const variant =
    latched.path === location.pathname
      ? latched.variant
      : classifyRouteTransition(latched.path, location.pathname);
  if (latched.path !== location.pathname) {
    // Remember where we are leaving the outgoing surface so a later back/ascend
    // can return here; the page hasn't scrolled yet (that happens on exit).
    rememberScroll(latched.path, window.scrollY);
    setLatched({
      path: location.pathname,
      variant,
      restoreScroll: restoresScroll(variant),
    });
  }

  if (reducedMotion) {
    return <Outlet />;
  }

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      custom={variant}
      onExitComplete={() =>
        window.scrollTo(
          0,
          scrollTargetFor(location.pathname, latched.restoreScroll),
        )
      }
    >
      <motion.div
        key={location.pathname}
        custom={variant}
        variants={developVariants}
        initial="latent"
        animate={held ? 'held' : 'developed'}
        exit="fixed"
        data-motion-wrapper
        data-animates={variant === 'none' ? 'false' : 'true'}
        data-variant={variant}
        data-held={held ? 'true' : 'false'}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};
