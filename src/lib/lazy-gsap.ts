/**
 * Lazy loader for GSAP + ScrollTrigger.
 *
 * Imported only from landing-route modules so the dynamic imports stay in the
 * landing chunk. `scripts/check-bundles.mjs` (npm run check:bundles) enforces
 * that GSAP never reaches `/app/*` chunks.
 */
export const loadGsap = async () => {
  const [{ default: gsap }, { default: ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
};
