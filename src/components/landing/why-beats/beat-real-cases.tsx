/**
 * Beat 01 — Real dermoscopic cases (INPUT).
 *
 * The opening beat of the Why scrub reel. Lays the foundation: every case is a
 * real ISIC archive lesion. The 4:5 thumbnail mirrors the hero's lesion frame
 * so the brand visual language reads continuously across the page. The huge
 * "01" mono numeral in the bleed corner is the film-strip metaphor's loudest
 * note on this beat — it signals "we are inside an advancing reel."
 *
 * Reduced-motion + mobile: same composition, stacked layout, no scrub
 * dependency.
 */
export const BeatRealCases = ({ stacked = false }: { stacked?: boolean }) => {
  return (
    <article
      data-beat="01"
      data-beat-key="real-cases"
      className="relative isolate flex w-full shrink-0 items-center overflow-hidden md:h-screen md:w-screen"
      style={stacked ? { minHeight: '80vh' } : undefined}
    >
      {/* Edge counter — huge mono, anchored bottom-right inside the frame */}
      <span
        aria-hidden
        className="text-primary/15 pointer-events-none absolute bottom-10 right-8 font-mono font-light leading-none tracking-[-0.04em] text-[8rem] md:bottom-16 md:right-12 md:text-[12rem]"
      >
        01
      </span>

      <div
        className={
          stacked
            ? 'mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16'
            : 'mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1fr] md:gap-16'
        }
      >
        {/* Image column — 4:5 mirror of the hero's lesion frame */}
        <figure className="flex w-full flex-col gap-3">
          <div className="border-hairline shadow-cinematic dark:surface-card-dark relative aspect-[4/5] w-full overflow-hidden rounded-card bg-muted/30">
            <img
              src="/ISIC_0000022.jpg"
              alt="Dermoscopic lesion from the ISIC Archive"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.06)_100%)]"
            />
          </div>
          <figcaption className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.22em] uppercase">
            From 2,000+ in the ISIC Archive
          </figcaption>
        </figure>

        {/* Copy column */}
        <div className="flex flex-col gap-6">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            01 · Input
          </p>
          <h3 className="font-display text-foreground text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Real lesions, not stock photos.
          </h3>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Curated from the ISIC Archive. Each case is an actual image a
            clinician would see in practice — not the polished textbook version.
          </p>
        </div>
      </div>
    </article>
  );
};
