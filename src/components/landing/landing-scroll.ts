import { useEffect, useRef, type RefObject } from 'react';

/**
 * Loads GSAP + ScrollTrigger via a dynamic import. Deliberately NOT the shared
 * `@/lib/lazy-gsap`: importing that module from this second route entry (the
 * `/dev/lesion-act` staging route, separate from the `/` landing route) makes
 * Vite split it into a standalone `lazy-gsap` chunk, which the bundle guard
 * rejects (GSAP is allowed only in `landing-*` / `gsap-*` chunks). Importing
 * `gsap` directly here keeps the GSAP code in the allowlisted `gsap-vendor`
 * chunk and the marker in this `landing-*` chunk. At cutover (#149) the Act
 * stage rejoins the landing route and this can fold back to the shared loader.
 */
const loadScrollTrigger = async () => {
  const [{ default: gsap }, { default: ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { ScrollTrigger };
};

/**
 * Act I's single pinned ScrollTrigger (#146): pins the stage to the viewport and
 * scrubs a 0→1 progress across the pinned scroll distance, written into
 * `progressRef` for the scene to read in useFrame. One scroll engine — the lazy
 * GSAP ScrollTrigger.
 *
 * Installs nothing while disabled (reduced-motion / static / before the scene
 * mounts), so those paths hold the wide arrive framing and never scrub.
 */
export const useActScroll = (
  progressRef: RefObject<number>,
  pinRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onProgress?: (p: number) => void,
  distance = '+=260%',
): void => {
  // Keep the latest callback in a ref so changing it never re-creates the pin.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    if (!enabled) return;
    const pin = pinRef.current;
    if (!pin) return;

    let cancelled = false;
    let instance: { kill: () => void } | null = null;

    void loadScrollTrigger().then(({ ScrollTrigger }) => {
      if (cancelled) return;
      instance = ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: distance,
        pin: true,
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          progressRef.current = self.progress;
          onProgressRef.current?.(self.progress);
        },
      });
      // start/end are measured at creation; fonts + cached images can shift
      // layout afterwards. Recompute once fonts settle so the pin stays aligned.
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
  }, [enabled, progressRef, pinRef, distance]);
};
