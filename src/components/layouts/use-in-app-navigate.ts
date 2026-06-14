import { useLocation, useNavigate, type NavigateOptions } from 'react-router';
import { useReducedMotion } from 'motion/react';

import {
  planInAppTransition,
  type InAppTransitionPlan,
} from '@/lib/plan-in-app-transition';
import { supportsViewTransitions } from '@/lib/view-transitions';

/**
 * Plan the hop from the current location to `to`. Shared by AppTabLink (which
 * reads it at render to set the <Link> viewTransition prop) and useInAppNavigate
 * (which reads it at click). One decision surface — `planInAppTransition` — so a
 * tab click and a ⌘K "Go to" hop always agree on whether to develop or cut.
 */
export const useHopPlanner = (): ((to: string) => InAppTransitionPlan) => {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion() ?? false;
  return (to) =>
    planInAppTransition({
      from: pathname,
      to,
      reducedMotion,
      supportsVT: supportsViewTransitions(),
    });
};

/**
 * Imperative twin of AppTabLink (#105). Navigate an in-app hop with the same
 * View Transition a tab click would play: the route swap crossfades and
 * conjugates by direction, or cuts instantly under reduced-motion / no support.
 * Used by the command palette and the Start-a-case picker so a programmatic hop
 * never bypasses the transition the way a bare navigate() would.
 */
export const useInAppNavigate = () => {
  const navigate = useNavigate();
  const planFor = useHopPlanner();
  return (to: string, options?: NavigateOptions) => {
    const { mode } = planFor(to);
    navigate(to, { ...options, viewTransition: mode === 'view-transition' });
  };
};
