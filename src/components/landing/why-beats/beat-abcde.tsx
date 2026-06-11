/**
 * Beat 02 — ABCDE-aware (FRAMEWORK).
 *
 * The brand-defining beat. Annotation circles pop in A→B→C→D→E as you scrub
 * through this beat — driven by the parent reel's GSAP timeline targeting
 * `[data-abcde-circle]` elements by index. The matching annotation list on the
 * right side reveals in sync (`[data-abcde-label]` items). This is the
 * centerpiece's signature gesture, compressed into a single beat of the
 * horizontal advance.
 *
 * The coordinate set mirrors the centerpiece's annotations so the framework
 * reads the same way in both moments.
 *
 * Reduced-motion + mobile: all circles + labels render in their resolved state
 * with no scrub dependency.
 */

const ANNOTATIONS = [
  {
    letter: 'A',
    centerPoint: [0.32, 0.38] as [number, number],
    short: 'Asymmetric',
  },
  {
    letter: 'B',
    centerPoint: [0.62, 0.5] as [number, number],
    short: 'Border',
  },
  {
    letter: 'C',
    centerPoint: [0.5, 0.32] as [number, number],
    short: 'Color',
  },
  {
    letter: 'D',
    centerPoint: [0.46, 0.62] as [number, number],
    short: 'Diameter',
  },
  {
    letter: 'E',
    centerPoint: [0.7, 0.36] as [number, number],
    short: 'Evolving',
  },
];

type Props = {
  stacked?: boolean;
  /** When true, render in fully-revealed state regardless of scrub. */
  resolved?: boolean;
};

export const BeatAbcde = ({ stacked = false, resolved = false }: Props) => {
  const initialStyle = resolved ? undefined : { opacity: 0 };

  return (
    <article
      data-beat="02"
      data-beat-key="abcde"
      className="relative isolate flex w-full shrink-0 items-center overflow-hidden md:h-screen md:w-screen"
      style={stacked ? { minHeight: '80vh' } : undefined}
    >
      {/* Edge counter — bottom-left for compositional variety */}
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
        {/* Image column with annotation circles */}
        <figure className="flex w-full flex-col gap-3">
          <div className="border-hairline shadow-cinematic dark:surface-card-dark relative aspect-[4/5] w-full overflow-hidden rounded-card bg-muted/30">
            <img
              src="/ISIC_0000022.jpg"
              alt="Dermoscopic lesion with ABCDE annotations"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {ANNOTATIONS.map((a, i) => {
                const [x, y] = a.centerPoint;
                return (
                  <circle
                    key={a.letter}
                    data-abcde-circle={i}
                    cx={x * 100}
                    cy={y * 100}
                    r={5.5}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.4}
                    vectorEffect="non-scaling-stroke"
                    className="text-primary"
                    style={initialStyle}
                  />
                );
              })}
            </svg>
          </div>
        </figure>

        {/* Copy column */}
        <div className="flex flex-col gap-6">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            02 · Framework
          </p>
          <h3 className="font-display text-foreground text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Five features, one decision.
          </h3>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Asymmetry. Border. Color. Diameter. Evolving. The pattern that
            drives the call — called out on the image itself.
          </p>

          <ul className="border-hairline divide-hairline mt-2 flex flex-col divide-y border-t border-b">
            {ANNOTATIONS.map((a, i) => (
              <li
                key={a.letter}
                data-abcde-label={i}
                className="text-muted-foreground flex items-baseline gap-4 py-2.5 text-sm"
                style={initialStyle}
              >
                <span className="text-primary font-mono text-xs tabular-nums tracking-[0.22em]">
                  {a.letter}
                </span>
                <span className="text-foreground">{a.short}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};
