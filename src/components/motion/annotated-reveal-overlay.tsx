import { motion, useReducedMotion } from 'motion/react';

import { motionTokens } from '@/lib/motion-tokens';
import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';

import { AnswerRevealSweep } from './answer-reveal-sweep';

type AnnotatedRevealOverlayProps = {
  features: AbcdeFeature[];
};

/**
 * The annotated branch of the centerpiece answer-reveal (slice #11).
 *
 * Plays the baseline sweep (slice #5) and then fades in a marker for each
 * ABCDE feature. Under reduced motion, the sweep is omitted and all markers
 * render statically.
 *
 * The feature markers are positioned at `centerPoint` × container (normalized
 * 0–1) and carry the letter as visible text plus the reasoning via aria-label
 * so screen readers announce the full teaching point.
 */
export const AnnotatedRevealOverlay = ({
  features,
}: AnnotatedRevealOverlayProps) => {
  const reducedMotion = useReducedMotion();

  const markers = features.map((feature) => (
    <FeatureMarker
      key={feature.letter}
      feature={feature}
      reducedMotion={Boolean(reducedMotion)}
    />
  ));

  if (reducedMotion) {
    return <>{markers}</>;
  }

  return (
    <>
      <AnswerRevealSweep />
      {markers}
    </>
  );
};

type FeatureMarkerProps = {
  feature: AbcdeFeature;
  reducedMotion: boolean;
};

const FeatureMarker = ({ feature, reducedMotion }: FeatureMarkerProps) => {
  const [xPct, yPct] = feature.centerPoint;

  const baseStyle = {
    position: 'absolute' as const,
    left: `${xPct * 100}%`,
    top: `${yPct * 100}%`,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background:
      'color-mix(in oklch, var(--primary) 12%, var(--background) 88%)',
    border: '1px solid color-mix(in oklch, var(--primary) 35%, transparent)',
    boxShadow: '0 0 0 4px color-mix(in oklch, var(--primary) 8%, transparent)',
    color: 'var(--primary)',
    fontWeight: 600,
    fontSize: '14px',
    pointerEvents: 'none' as const,
  };

  if (reducedMotion) {
    return (
      <div
        data-abcde-marker
        aria-label={`${feature.letter} — ${feature.reasoning}`}
        style={baseStyle}
      >
        {feature.letter}
      </div>
    );
  }

  return (
    <motion.div
      data-abcde-marker
      aria-label={`${feature.letter} — ${feature.reasoning}`}
      style={baseStyle}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...motionTokens.normal, delay: 0.42 }}
    >
      {feature.letter}
    </motion.div>
  );
};
