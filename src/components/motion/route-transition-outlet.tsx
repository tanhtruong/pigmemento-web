import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';

import { developVariants } from '@/lib/motion-tokens';
import {
  classifyRouteTransition,
  type RouteTransitionVariant,
} from '@/lib/route-transition';

/**
 * RouteTransitionOutlet — speaks the in-app transition grammar (#53).
 *
 * Every hop between app surfaces plays the Develop, conjugated by the
 * relationship between the two routes (lateral / descend / ascend / advance,
 * classified in `lib/route-transition`). The presence stays mounted across
 * all hops — including non-animated ones — so the very first navigation
 * after entering the app already plays a full fix/develop pair.
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

type LatchedHop = { path: string; variant: RouteTransitionVariant };

export const RouteTransitionOutlet = () => {
  const reducedMotion = useReducedMotion();
  const location = useLocation();

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
        animate="developed"
        exit="fixed"
        data-motion-wrapper
        data-animates={variant === 'none' ? 'false' : 'true'}
        data-variant={variant}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};
