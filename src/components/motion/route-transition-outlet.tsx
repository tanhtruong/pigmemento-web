import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';

import { motionTokens } from '@/lib/motion-tokens';
import { shouldAnimateRouteTransition } from '@/lib/route-transition';

export const RouteTransitionOutlet = () => {
  const reducedMotion = useReducedMotion();
  const location = useLocation();

  const previousPathRef = useRef<string | undefined>(undefined);
  const previousPath = previousPathRef.current;

  useEffect(() => {
    previousPathRef.current = location.pathname;
  });

  if (reducedMotion) {
    return <Outlet />;
  }

  const animates = shouldAnimateRouteTransition(
    previousPath,
    location.pathname,
  );

  if (!animates) {
    return (
      <div data-motion-wrapper data-animates="false">
        <Outlet />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        data-motion-wrapper
        data-animates="true"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={motionTokens.normal}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};
