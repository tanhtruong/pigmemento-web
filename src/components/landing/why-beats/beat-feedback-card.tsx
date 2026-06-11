/**
 * Beat 03 — Feedback that teaches (OUTPUT).
 *
 * The synthetic asset of the reel. Composes an editorial mock of the exact
 * feedback a learner gets after an answer: their wrong answer struck through,
 * the amber correction served in display serif, and the teaching one-liner
 * that explains the pattern. Rotated -2deg for editorial dynamism — the only
 * tilted composition on the page so it lands as the editorial moment.
 *
 * The card uses an SVG mini-lesion drawing rather than a real dermoscopy
 * thumbnail to keep the asset self-contained and avoid the redundancy of
 * showing a third lesion image in a row.
 */
export const BeatFeedbackCard = ({
  stacked = false,
}: {
  stacked?: boolean;
}) => {
  return (
    <article
      data-beat="03"
      data-beat-key="feedback"
      className="relative isolate flex w-full shrink-0 items-center overflow-hidden md:h-screen md:w-screen"
      style={stacked ? { minHeight: '80vh' } : undefined}
    >
      {/* Edge counter — top-right, anchored inside the frame */}
      <span
        aria-hidden
        className="text-primary/15 pointer-events-none absolute top-20 right-8 font-mono font-light leading-none tracking-[-0.04em] text-[8rem] md:top-28 md:right-12 md:text-[12rem]"
      >
        03
      </span>

      <div
        className={
          stacked
            ? 'mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16'
            : 'mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1fr] md:gap-16'
        }
      >
        {/* Feedback card composition */}
        <div className="relative flex items-center justify-center md:py-8">
          <div className="border-hairline shadow-warm dark:surface-card-dark relative flex w-full max-w-md flex-col gap-5 rounded-card border bg-card p-7 -rotate-[1.5deg]">
            {/* Top row — mini lesion + ABCDE pin */}
            <div className="flex items-start gap-4">
              <div className="border-hairline relative h-24 w-24 shrink-0 overflow-hidden rounded-md border">
                <img
                  src="/ISIC_0000022.jpg"
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* Single annotation circle pointing to the medial border */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <circle
                    cx={62}
                    cy={50}
                    r={11}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.6}
                    vectorEffect="non-scaling-stroke"
                    className="text-primary"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-muted-foreground font-mono text-[0.6rem] tracking-[0.22em] uppercase">
                  Case 042 · Your answer
                </p>
                <p className="text-muted-foreground/70 line-through font-sans text-sm">
                  Benign nevus
                </p>
              </div>
            </div>

            {/* Hairline divider */}
            <div className="border-hairline border-t" />

            {/* Correction — the serif amber moment */}
            <div className="flex flex-col gap-2">
              <p className="text-primary font-mono text-[0.6rem] tracking-[0.22em] uppercase">
                The pattern
              </p>
              <p className="font-display text-primary text-3xl leading-tight">
                Melanoma
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                The medial border is the tell — irregular, with three color
                zones bleeding into one another.
              </p>
            </div>
          </div>
        </div>

        {/* Copy column */}
        <div className="flex flex-col gap-6">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            03 · Output
          </p>
          <h3 className="font-display text-foreground text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Feedback that teaches the pattern.
          </h3>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Every answer comes with the reasoning. Not right or wrong —{' '}
            <span className="text-foreground italic">
              here&apos;s what to look for next time.
            </span>
          </p>
        </div>
      </div>
    </article>
  );
};
