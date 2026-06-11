import { motion, useReducedMotion } from 'motion/react';

import { motionTokens } from '@/lib/motion-tokens';

type AnswerRevealSweepProps = {
  onComplete?: () => void;
};

/**
 * The centerpiece sweep: a soft-circle mark travels left → right across its
 * container over 420ms (`considered` timing). Fires `onComplete` once the
 * sweep finishes so callers (e.g. /case-review) can time the verdict slide.
 *
 * Renders nothing under `prefers-reduced-motion` — the caller is expected to
 * skip the sweep and mount the verdict immediately.
 */
export const AnswerRevealSweep = ({ onComplete }: AnswerRevealSweepProps) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <motion.div
      data-testid="answer-reveal-sweep"
      data-sweeping="true"
      aria-hidden="true"
      initial={{ left: '-20%' }}
      animate={{ left: '110%' }}
      transition={motionTokens.considered}
      onAnimationComplete={() => onComplete?.()}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '30%',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        border:
          '1px solid color-mix(in oklch, var(--primary) 35%, transparent)',
        boxShadow:
          '0 0 0 4px color-mix(in oklch, var(--primary) 8%, transparent), inset 0 0 24px color-mix(in oklch, var(--primary) 6%, transparent)',
        pointerEvents: 'none',
      }}
    />
  );
};
