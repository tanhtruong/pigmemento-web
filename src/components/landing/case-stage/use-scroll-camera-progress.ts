import { useEffect, type RefObject } from 'react';

import { loadGsap } from '@/lib/lazy-gsap';

/**
 * Bridges the lazy-loaded GSAP ScrollTrigger to the r3f camera: maps the lesion
 * frame's transit through the viewport to a 0→1 value written into
 * `progressRef`, which the CameraRig reads in useFrame. One scroll engine — the
 * same ScrollTrigger the landing already lazy-loads, no second scroll system.
 *
 * The trigger is the frame itself (`triggerRef`), start `top bottom` → end
 * `bottom top`, so all four framings — and the ABCDE pins on the close-up beat
 * (#131) — play while the un-pinned stage is actually on-screen. (Mapping to
 * whole-page scroll instead pushed the close beat past the canvas's exit.)
 *
 * `enabled` is false under reduced-motion / static / before the scene mounts, so
 * those paths install nothing and the camera holds its wide framing — no scrub.
 */
export const useScrollCameraProgress = (
  progressRef: RefObject<number>,
  triggerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void => {
  useEffect(() => {
    if (!enabled) return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    let cancelled = false;
    let instance: { kill: () => void } | null = null;

    loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled) return;
      instance = ScrollTrigger.create({
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          progressRef.current = self.progress;
        },
      });
      // start/end are measured at creation; web fonts and cached images can
      // shift layout afterwards. Recompute once fonts settle so the framings
      // stay aligned to the frame's real on-screen transit.
      if (document.fonts?.ready) {
        void document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      }
    });

    return () => {
      cancelled = true;
      instance?.kill();
    };
  }, [enabled, progressRef, triggerRef]);
};
