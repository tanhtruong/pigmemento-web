import { motion, useReducedMotion } from 'motion/react';

import { RING_FILL_MS } from '@/lib/motion-tokens';

/**
 * Hairline commit ring around a submit button while its mutation is in
 * flight — the same clockwise sweep the case-attempt choice cards use on
 * commit (#47). Once closed, the ring breathes (slow opacity pulse) until
 * the request settles, so a slow network reads as "still working", never
 * stalled.
 *
 * Strokes in `currentColor`: on the amber primary button that's the ink
 * foreground, so the ring reads as part of the button's own voice.
 * Reduced motion renders the ring already closed, without sweep or pulse.
 *
 * Parent button must be `relative` — the ring is absolutely positioned.
 */
export const SubmitRing = ({ active }: { active: boolean }) => {
  const reducedMotion = useReducedMotion();

  if (!active) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.rect
        x="1"
        y="1"
        width="98"
        height="98"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        initial={{ pathLength: reducedMotion ? 1 : 0, opacity: 1 }}
        animate={{
          pathLength: 1,
          opacity: reducedMotion ? 1 : [1, 0.55, 1],
        }}
        transition={{
          pathLength: { duration: RING_FILL_MS / 1000, ease: 'easeOut' },
          opacity: {
            duration: 1.2,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: RING_FILL_MS / 1000,
          },
        }}
      />
    </svg>
  );
};
