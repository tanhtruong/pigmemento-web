import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation, useNavigation } from 'react-router';

import { developVariants, PENDING_HOLD_MS } from '@/lib/motion-tokens';
import {
  classifyRouteTransition,
  shouldAnimateRouteTransition,
  type RouteTransitionVariant,
} from '@/lib/route-transition';

/**
 * RouteTransitionOutlet — speaks the in-app transition grammar (#53, #65).
 *
 * Every hop between app surfaces dissolves, conjugated by the relationship
 * between the two routes (lateral / descend / ascend / advance, classified in
 * `lib/route-transition`). The leaving surface fades DOWN to the dissolve floor
 * and the arriving one fades UP from it (with an 8px directional drift) — the
 * screen never reaches a blank frame, so there's no blink between screens
 * (#65). `mode="wait"` keeps a single surface mounted at a time; the floor
 * masks the swap the way a crossfade midpoint would.
 *
 * The hop's variant is LATCHED per pathname change (state adjusted during
 * render), never recomputed from the live location: re-renders that land
 * while the exit is still playing must not downgrade the pending hop to
 * `none`.
 *
 * `custom` is set on both the presence and the child: AnimatePresence
 * re-renders exiting children with its own `custom`, which is how the
 * outgoing surface fades with the *current* hop's grammar.
 */

type LatchedHop = { path: string; variant: RouteTransitionVariant };

/**
 * Pending fix-out dim (#54). While a route loader holds navigation past
 * PENDING_HOLD_MS, the still-mounted outgoing surface eases into the held
 * fix — the click acknowledged without a spinner. Resolves under the
 * threshold (the react-query cached majority) never trigger it, and hops
 * whose grammar is `none` (the attempt → review centerpiece) never dim.
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
  });
  const variant =
    latched.path === location.pathname
      ? latched.variant
      : classifyRouteTransition(latched.path, location.pathname);
  if (latched.path !== location.pathname) {
    setLatched({ path: location.pathname, variant });
  }

  if (reducedMotion) {
    return <Outlet />;
  }

  // Reset scroll under the dissolve: onExitComplete fires once the leaving
  // surface has faded to the floor and unmounted, just as the arriving one
  // mounts — so the top is restored while the screen is mid-dissolve, never as
  // a visible jump on still-showing content.
  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      custom={variant}
      onExitComplete={() => window.scrollTo(0, 0)}
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
