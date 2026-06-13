import { motion } from 'motion/react';

import {
  WASH_DURATION_MS,
  developWash,
  motionDurations,
} from '@/lib/motion-tokens';
import type { RouteTransitionVariant } from '@/lib/route-transition';
import { GrainOverlay } from '@/components/foundation/grain-overlay';

type DevelopWashVariant = Extract<
  RouteTransitionVariant,
  'descend' | 'advance'
>;

type DevelopWashProps = {
  variant: DevelopWashVariant;
  onComplete: () => void;
};

/**
 * DevelopWash — the warm "develop" layer (#59).
 *
 * A single full-bleed amber gradient that rises to cover, masks the route swap
 * underneath, then clears onto the developed surface — the print lifting out
 * of the bath. Fired ONLY on descend/advance INTO case-flow surfaces, so the
 * warmth *means* "entering case work"; quiet lateral tab hops never see it.
 *
 * It animates opacity on one compositor layer, so the route tree underneath
 * never repaints for the develop (the #53 develop filtered the whole subtree
 * every frame). Rendered inside the outlet, which sits in `<main>`'s z-10
 * stacking context, so the wash covers the content area but paints *under* the
 * persistent topbar/tabs — you stay in the app while the case develops. Grain
 * rides along so the amber never reads as flat digital colour, matching the
 * boundary bloom's material (#43).
 */
export const DevelopWash = ({ variant, onComplete }: DevelopWashProps) => {
  const durationMs =
    WASH_DURATION_MS[variant] ?? Math.round(motionDurations.considered * 1000);

  return (
    <motion.div
      aria-hidden
      data-develop-wash={variant}
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      style={{ height: '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: developWash.keyframes }}
      transition={{
        duration: durationMs / 1000,
        times: developWash.times,
        ease: 'linear',
      }}
      onAnimationComplete={onComplete}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(120% 90% at 50% 32%,
            oklch(from var(--primary) calc(l + 0.06) c h) 0%,
            var(--primary) 55%,
            oklch(from var(--primary) calc(l - 0.05) c h) 100%)`,
        }}
      />
      <GrainOverlay scope="panel" intensity={1.2} seed={7} />
    </motion.div>
  );
};
