/**
 * Beat 02 — Breadth & source credibility (LIBRARY).
 *
 * Replaces the earlier ABCDE-circles beat, whose annotation gesture the hero
 * and centerpiece now own twice already. This beat instead carries the claim
 * that authenticity (beat 01) doesn't: scale and curation rigor. A serif
 * "2,000+" lockup — echoing beat 04's number lockup — anchors the left; the
 * copy makes the breadth + expert-review case on the right.
 *
 * Static composition — its proof reads fully on arrival, so it needs no scrub
 * dependency (only beat 04 still animates inside the reel). Reduced-motion +
 * mobile: identical, stacked.
 */

type Props = {
  stacked?: boolean;
};

export const BeatBreadth = ({ stacked = false }: Props) => {
  return (
    <article
      data-beat="02"
      data-beat-key="breadth"
      className="relative isolate flex w-full shrink-0 items-center overflow-hidden md:h-screen md:w-screen"
      style={stacked ? { minHeight: '80vh' } : undefined}
    >
      {/* Edge counter — bottom-left, matching the beat it replaces */}
      <span
        aria-hidden
        className="text-primary/15 pointer-events-none absolute bottom-10 left-8 font-mono font-light leading-none tracking-[-0.04em] text-[8rem] md:bottom-16 md:left-12 md:text-[12rem]"
      >
        02
      </span>

      <div
        className={
          stacked
            ? 'mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16'
            : 'mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1fr] md:gap-16'
        }
      >
        {/* Breadth lockup — serif count + mono captions, echoing beat 04 */}
        <div className="relative flex flex-col items-center gap-6 md:items-start">
          <div className="flex flex-col gap-2">
            <span className="font-display text-foreground text-7xl leading-none tracking-tight md:text-8xl">
              2,000+
            </span>
            <span className="text-muted-foreground font-mono text-xs tracking-[0.22em] uppercase">
              Curated cases
            </span>
          </div>
          <p className="text-muted-foreground/70 font-mono text-[0.6875rem] tracking-[0.22em] uppercase">
            Expert-reviewed · de-identified
          </p>
        </div>

        {/* Copy column */}
        <div className="flex flex-col gap-6">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            02 · Library
          </p>
          <h3 className="font-display text-foreground text-4xl leading-[1.05] tracking-tight md:text-5xl">
            A library, not a handful.
          </h3>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Expert-reviewed, de-identified cases drawn from the ISIC Archive —
            spanning textbook-clear to genuinely hard. Enough range to drill
            until the pattern sticks.
          </p>
        </div>
      </div>
    </article>
  );
};
