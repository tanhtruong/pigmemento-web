import { Link, useLocation, type LinkProps } from 'react-router';
import { useReducedMotion } from 'motion/react';

import { planInAppTransition } from '@/lib/plan-in-app-transition';
import { supportsViewTransitions } from '@/lib/view-transitions';

type AppTabLinkProps = Omit<LinkProps, 'to'> & { to: string };

/**
 * AppTabLink — the single navigation surface for in-app hops (#102).
 *
 * A plain React Router <Link> whose View Transition is decided per hop:
 * `planInAppTransition` says crossfade when the browser supports it, motion is
 * allowed, and the surface actually changes — otherwise the hop cuts instantly.
 * It wraps <Link> (never a button) so the primary tabs keep real anchor
 * semantics: href, ⌘/middle-click to open in a new tab, and keyboard.
 *
 * Programmatic hops (e.g. the command palette) reuse `planInAppTransition` the
 * same way instead of calling navigate() bare, so every in-app hop animates
 * alike (#105).
 */
export const AppTabLink = ({ to, ...props }: AppTabLinkProps) => {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion() ?? false;

  const { mode } = planInAppTransition({
    from: pathname,
    to,
    reducedMotion,
    supportsVT: supportsViewTransitions(),
  });

  return (
    <Link {...props} to={to} viewTransition={mode === 'view-transition'} />
  );
};
