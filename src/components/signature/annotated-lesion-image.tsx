import { cn } from '@/lib/utils';
import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';

type AnnotatedLesionImageProps = {
  src: string;
  alt: string;
  /** Annotations on the image. Empty array = clean image, no overlays. */
  features?: AbcdeFeature[];
  /** Aspect-ratio constraint. 4:5 portrait by default (hero + mobile case). */
  aspect?: '1:1' | '4:5' | '5:4' | '3:2';
  /** ISIC archive code or equivalent attribution string. Rendered in Geist Mono. */
  sourceCredit?: string;
  /** When true, annotations are rendered in the static composed position
   *  (reduced-motion path / PR1 showcase). PR5 animates them via revealSequence. */
  showAnnotations?: boolean;
  className?: string;
};

const ASPECT_CLASS: Record<
  NonNullable<AnnotatedLesionImageProps['aspect']>,
  string
> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '5:4': 'aspect-[5/4]',
  '3:2': 'aspect-[3/2]',
};

/**
 * Editorial-framed lesion image with margin-side ABCDE annotations.
 *
 * - Image gets a hairline border + warm shadow (light) or surface-card-dark
 *   gradient (dark).
 * - Annotations are 1.5px hairline circles, no fill, with thin connector
 *   lines to margin-side labels (Geist Mono letter + Geist Sans clause).
 * - Source credit caption sits beneath the image — Geist Mono caps.
 *
 * PR5 wires the reveal-sequence animation. PR1 renders the composed state.
 */
export const AnnotatedLesionImage = ({
  src,
  alt,
  features = [],
  aspect = '4:5',
  sourceCredit,
  showAnnotations = true,
  className,
}: AnnotatedLesionImageProps) => {
  return (
    <figure
      data-slot="annotated-lesion-image"
      className={cn('flex flex-col gap-3', className)}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-card border border-hairline',
          'bg-muted/30 shadow-warm dark:shadow-cinematic dark:surface-card-dark',
          ASPECT_CLASS[aspect],
        )}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {showAnnotations && features.length > 0 && (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {features.map((f) => {
              const [x, y] = f.centerPoint;
              return (
                <circle
                  key={f.letter}
                  cx={x * 100}
                  cy={y * 100}
                  r={6}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={0.4}
                  className="text-primary"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* Margin-side labels — Geist Mono letter + Geist Sans clause */}
      {showAnnotations && features.length > 0 && (
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.letter} className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-primary tabular-nums">
                {f.letter}
              </span>
              <span className="text-sm text-muted-foreground">
                {f.reasoning}
              </span>
            </li>
          ))}
        </ul>
      )}

      {sourceCredit && (
        <figcaption className="font-mono text-[0.6875rem] tracking-wider text-muted-foreground uppercase">
          {sourceCredit}
        </figcaption>
      )}
    </figure>
  );
};
