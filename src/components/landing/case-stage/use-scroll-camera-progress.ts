import { useEffect, type RefObject } from 'react';

import { loadGsap } from '@/lib/lazy-gsap';

/**
 * Bridges the lazy-loaded GSAP ScrollTrigger to the r3f camera: maps page scroll
 * to a 0→1 value written into `progressRef`, which the CameraRig reads in
 * useFrame. One scroll engine — the same ScrollTrigger the landing already
 * lazy-loads, no second scroll system.
 *
 * `enabled` is false under reduced-motion / static / before the scene mounts, so
 * those paths install nothing and the camera holds its wide framing — no scrub.
 */
export const useScrollCameraProgress = (
  progressRef: RefObject<number>,
  enabled: boolean,
): void => {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let trigger: { kill: () => void } | null = null;

    loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled) return;
      trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          progressRef.current = self.progress;
        },
      });
      // `end: 'max'` is measured at creation; web fonts and cached images can
      // grow the page afterwards, leaving the framings mapped to a stale, short
      // scroll range. Recompute once fonts settle so the dolly spans the page.
      if (document.fonts?.ready) {
        void document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      }
    });

    return () => {
      cancelled = true;
      trigger?.kill();
    };
  }, [enabled, progressRef]);
};
