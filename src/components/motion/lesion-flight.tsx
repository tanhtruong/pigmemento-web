import { useLayoutEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

import type { LesionFlightOrigin, LesionFlightRect } from '@/lib/lesion-flight';
import { motionTokens } from '@/lib/motion-tokens';

type LesionFlightProps = {
  origin: LesionFlightOrigin;
  /** The hero frame the print lands in — measured after the attempt lays out. */
  targetRef: RefObject<HTMLElement | null>;
  /** Fired exactly when the print docks; reveal the hero in the same commit. */
  onLanded: () => void;
};

/**
 * The lesion print in flight (#55): a fixed-position clone portaled above
 * the route swap, lifting from the Library thumb's recorded rect and flying
 * into the attempt hero, radius morphing between the two frames. Rides above
 * the descend Develop playing beneath — the print leads, the surface follows.
 */
export const LesionFlight = ({
  origin,
  targetRef,
  onLanded,
}: LesionFlightProps) => {
  const [target, setTarget] = useState<{
    rect: LesionFlightRect;
    radius: string;
  } | null>(null);

  useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) {
      // Nothing to land on — reveal the hero untouched rather than fly blind.
      onLanded();
      return;
    }
    const rect = el.getBoundingClientRect();
    setTarget({
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      radius: getComputedStyle(el).borderRadius || '0px',
    });
  }, [targetRef, onLanded]);

  if (!target) return null;

  return createPortal(
    <motion.img
      data-lesion-flight
      src={origin.src}
      alt=""
      aria-hidden
      initial={{ ...origin.rect, borderRadius: origin.radius || '0px' }}
      animate={{ ...target.rect, borderRadius: target.radius }}
      transition={motionTokens.flight}
      onAnimationComplete={onLanded}
      className="pointer-events-none fixed z-50 object-cover"
    />,
    document.body,
  );
};
