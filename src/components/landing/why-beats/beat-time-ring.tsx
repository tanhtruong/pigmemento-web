/**
 * Beat 04 — Respects your time (PROMISE).
 *
 * The closing beat. A hairline ring (echoing the ABCDE annotation-circle
 * vocabulary) holds a serif "90s" lockup; an amber arc inside the ring fills
 * from 0 to ~95% driven by the parent reel's scrub timeline targeting
 * `[data-time-arc]`. The ring's geometry uses stroke-dasharray + dashoffset
 * for the fill — the arc reads as a stopwatch sweep.
 *
 * Reduced-motion + mobile: the arc lands at its ~95% position with no scrub
 * dependency.
 */

const RING_CIRCUMFERENCE = 2 * Math.PI * 45; // r=45 in viewBox 100×100

type Props = {
  stacked?: boolean;
  /** When true, render with arc fully filled. */
  resolved?: boolean;
};

export const BeatTimeRing = ({ stacked = false, resolved = false }: Props) => {
  const filledOffset = RING_CIRCUMFERENCE * (1 - 0.95);

  return (
    <article
      data-beat="04"
      data-beat-key="time-ring"
      className="relative isolate flex w-full shrink-0 items-center overflow-hidden md:h-screen md:w-screen"
      style={stacked ? { minHeight: '80vh' } : undefined}
    >
      {/* Edge counter — bottom-right, the page's final "04" */}
      <span
        aria-hidden
        className="text-primary/15 pointer-events-none absolute bottom-10 right-8 font-mono font-light leading-none tracking-[-0.04em] text-[8rem] md:bottom-16 md:right-12 md:text-[12rem]"
      >
        04
      </span>

      <div
        className={
          stacked
            ? 'mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16'
            : 'mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1fr] md:gap-16'
        }
      >
        {/* Ring composition */}
        <div className="relative flex flex-col items-center justify-center gap-6 md:items-start">
          <div className="relative aspect-square w-64 md:w-80">
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full -rotate-90"
              aria-hidden
            >
              {/* Hairline outer ring — matches ABCDE annotation-circle stroke */}
              <circle
                cx={50}
                cy={50}
                r={45}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
                className="text-hairline"
              />
              {/* Amber arc — filled by scrub */}
              <circle
                data-time-arc
                cx={50}
                cy={50}
                r={45}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="text-primary"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={resolved ? filledOffset : RING_CIRCUMFERENCE}
              />
            </svg>
            {/* Serif numeral inside the ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-foreground text-7xl leading-none md:text-8xl">
                90
              </span>
              <span className="text-muted-foreground font-mono text-xs tracking-[0.22em] uppercase mt-1">
                Seconds
              </span>
            </div>
          </div>
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.22em] uppercase">
            One case · Coffee break
          </p>
        </div>

        {/* Copy column */}
        <div className="flex flex-col gap-6">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            04 · Promise
          </p>
          <h3 className="font-display text-foreground text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Ninety seconds. Pattern earned.
          </h3>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Sessions that fit a coffee break. Drills that stack into a study
            journal — not a leaderboard, not a streak you have to feed.
          </p>
        </div>
      </div>
    </article>
  );
};
