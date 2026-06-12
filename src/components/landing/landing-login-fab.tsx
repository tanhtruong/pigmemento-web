import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthEntry } from '@/features/auth/hooks/use-auth-entry';
import { motionDurations } from '@/lib/motion-tokens';

/**
 * LandingLoginFab — the persistent re-entry affordance.
 *
 * Lives bottom-right from page-load and stays put for the entire landing
 * scroll, giving returning users one tap to log back in without scrolling
 * to find the rail's terminal frame. Desktop wraps the button in a
 * hairline tooltip ("LOG IN →" mono caps) on hover/focus; mobile relies
 * on the icon being a universally-understood "go" affordance.
 *
 * The FAB intentionally fades in *after* the hero stagger (0.6s delay)
 * so it doesn't compete with the question hero's introduction.
 */
export const LandingLoginFab = () => {
  const shouldReduceMotion = useReducedMotion();
  const entry = useAuthEntry();

  const button = (
    <Link
      to={entry.href}
      onClick={entry.onClick}
      onMouseEnter={entry.onMouseEnter}
      onFocus={entry.onFocus}
      aria-label="Log in"
      className="group/fab bg-primary text-primary-foreground shadow-amber-glow ease-considered hover:brightness-[1.04] active:scale-95 motion-reduce:active:scale-100 focus-visible:ring-ring focus-visible:ring-offset-background fixed right-5 bottom-[calc(env(safe-area-inset-bottom,0)+1.25rem)] z-30 inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:h-12 md:w-12"
    >
      <ArrowRight
        className="h-5 w-5 transition-transform duration-200 group-hover/fab:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : motionDurations.considered,
        delay: shouldReduceMotion ? 0 : 0.6,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={10}
            className="border-hairline bg-background/95 text-foreground hidden border px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.22em] uppercase backdrop-blur-md md:flex"
          >
            <span>Log in</span>
            <ArrowRight className="text-primary ml-1.5 h-3 w-3" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};
