import { cn } from '@/utils/cn';

type GrainOverlayProps = {
  /** Opacity 0-100. Dark landing wants ~1.5; light app paper wants ~1. */
  intensity?: number;
  /** Render fixed-positioned full-viewport (page-level) or absolute (panel-level). */
  scope?: 'page' | 'panel';
  /** A different seed produces a different noise pattern — avoids repeating textures across stacked surfaces. */
  seed?: number;
  className?: string;
};

/**
 * Material grain — the secret-sauce texture that separates polished from premium.
 * One SVG turbulence filter, ~1.5% opacity, pointer-events:none. Effectively free
 * (single composited layer, GPU-friendly). The dark landing reads as film-grain;
 * the light app reads as paper.
 *
 * Implementation note: the noise is generated via feTurbulence at a fixed
 * baseFrequency so it doesn't shimmer between repaints. Pre-rendered once.
 */
export const GrainOverlay = ({
  intensity = 1.5,
  scope = 'page',
  seed = 7,
  className,
}: GrainOverlayProps) => {
  const id = `grain-${seed}`;
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none mix-blend-overlay',
        scope === 'page' ? 'fixed inset-0 z-[1]' : 'absolute inset-0',
        className,
      )}
      style={{ opacity: intensity / 100 }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </div>
  );
};
