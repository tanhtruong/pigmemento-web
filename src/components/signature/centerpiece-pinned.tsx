import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';
import { loadGsap } from '@/lib/lazy-gsap';
import { useIsMobile } from '@/hooks/use-is-mobile';

/**
 * Landing centerpiece — the pinned-scroll case walkthrough.
 *
 * Five scrubbed beats over ~5 viewport heights of scroll distance:
 *   1. (0-20%)   Image enters at 5:4, eyebrow + intro line visible.
 *   2. (20-45%)  Image scales toward full-bleed; ABCDE annotations
 *                pop in one at a time (A → B → C → D → E).
 *   3. (45-55%)  Climax — image is full-bleed, all annotations on screen.
 *   4. (55-70%)  Image returns to 5:4 framed position.
 *   5. (70-100%) Serif "Diagnosis: Melanoma" reveals + teaching prose
 *                fades in. Then a small CTA to start practicing.
 *
 * Reduced motion: the static composed frame (5:4 image + all annotations
 * pre-rendered + diagnosis + teaching) is rendered without a timeline.
 */
type Annotation = {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  /** Center on the image as [x, y] in 0-1 normalized coordinates. */
  centerPoint: [number, number];
  reasoning: string;
};

const ANNOTATIONS: Annotation[] = [
  {
    letter: 'A',
    centerPoint: [0.32, 0.38],
    reasoning: 'Asymmetric across the long axis',
  },
  {
    letter: 'B',
    centerPoint: [0.62, 0.5],
    reasoning: 'Irregular border on the medial edge',
  },
  {
    letter: 'C',
    centerPoint: [0.5, 0.32],
    reasoning: 'Multiple colors within the lesion',
  },
  {
    letter: 'D',
    centerPoint: [0.46, 0.62],
    reasoning: 'Diameter exceeds 6 mm at widest',
  },
  {
    letter: 'E',
    centerPoint: [0.7, 0.36],
    reasoning: 'Evolving — gradual darkening over months',
  },
];

const DIAGNOSIS = 'Melanoma';
const TEACHING =
  'Look at how the color shifts left-to-right — that asymmetry is one of the strongest signals here, paired with the irregular medial border and the patient’s history of gradual darkening.';

type CenterpiecePinnedProps = {
  /** Path to the dermoscopic image (4:5 portrait works best). */
  imageSrc?: string;
  imageAlt?: string;
  sourceCredit?: string;
  className?: string;
};

export const CenterpiecePinned = ({
  imageSrc = '/ISIC_0000022.jpg',
  imageAlt = 'Dermoscopic image of a pigmented skin lesion',
  sourceCredit = 'ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE',
  className,
}: CenterpiecePinnedProps) => {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // On phones the 500%-scroll pin reads as a hijack, not cinema — fall back to
  // the composed static frame (same branch as reduced-motion), matching how the
  // Why reel and FAQ already degrade. Keeps the mobile scroll-through coherent.
  if (reducedMotion || isMobile) {
    return (
      <CenterpieceStatic
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        sourceCredit={sourceCredit}
        className={className}
      />
    );
  }

  return (
    <CenterpieceAnimated
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      sourceCredit={sourceCredit}
      className={className}
    />
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

const CenterpieceAnimated = ({
  imageSrc,
  imageAlt,
  sourceCredit,
  className,
}: Required<
  Pick<CenterpiecePinnedProps, 'imageSrc' | 'imageAlt' | 'sourceCredit'>
> &
  Pick<CenterpiecePinnedProps, 'className'>) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const annotationListRef = useRef<HTMLUListElement>(null);
  const diagnosisRef = useRef<HTMLDivElement>(null);
  const teachingRef = useRef<HTMLParagraphElement>(null);
  const annotationRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let killed = false;
    let trigger: { kill: () => void } | null = null;

    loadGsap().then(({ gsap }) => {
      if (killed || !sectionRef.current || !stageRef.current) return;

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: stageRef.current,
            start: 'top top',
            end: '+=500%',
            scrub: 0.4,
          },
        });

        // Beat 1 → 2 (20-45%): image scales toward full-bleed
        tl.fromTo(
          imageWrapRef.current,
          { scale: 1 },
          { scale: 1.45, ease: 'power2.inOut', duration: 1 },
          0.2,
        );

        // Annotations stagger in (A → E) across beat 2
        ANNOTATIONS.forEach((_, i) => {
          const start = 0.22 + i * 0.035;
          tl.fromTo(
            annotationRefs.current[i],
            { opacity: 0, scale: 0 },
            {
              opacity: 1,
              scale: 1,
              transformOrigin: 'center',
              ease: 'back.out(2)',
              duration: 0.6,
            },
            start,
          );
          tl.fromTo(
            labelRefs.current[i],
            { opacity: 0, x: -6 },
            { opacity: 1, x: 0, ease: 'power2.out', duration: 0.6 },
            start + 0.04,
          );
        });

        // Beat 4 (55-70%): image returns to 5:4
        tl.to(
          imageWrapRef.current,
          { scale: 1, ease: 'power2.inOut', duration: 1 },
          0.55,
        );

        // Beat 5 (70-100%): diagnosis + teaching.
        // The intro state (eyebrow, intro line, AND the annotation list) must
        // ALL fade together — otherwise the list stays on top of the diagnosis
        // overlay and the right column becomes unreadable at climax.
        tl.fromTo(
          [eyebrowRef.current, introRef.current, annotationListRef.current],
          { opacity: 1 },
          { opacity: 0, duration: 0.4 },
          0.62,
        );
        tl.fromTo(
          diagnosisRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 },
          0.72,
        );
        tl.fromTo(
          teachingRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 },
          0.82,
        );

        trigger = tl.scrollTrigger ?? null;
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => {
      killed = true;
      trigger?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how"
      data-slot="centerpiece-pinned"
      data-how-pinned
      className={cn('relative isolate w-full', className)}
      aria-label="How a Pigmemento case works"
    >
      <div
        ref={stageRef}
        className="relative flex h-screen items-center overflow-hidden"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1fr]">
          {/* Image column */}
          <div className="relative">
            <div
              ref={imageWrapRef}
              className="border-hairline shadow-cinematic dark:surface-card-dark relative aspect-[4/5] w-full origin-center overflow-hidden rounded-card border bg-muted/30 will-change-transform"
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />

              {/* Annotation circles — hairline, no fill */}
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
                      ref={(el) => {
                        annotationRefs.current[i] = el;
                      }}
                      cx={x * 100}
                      cy={y * 100}
                      r={5.5}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={0.4}
                      vectorEffect="non-scaling-stroke"
                      className="text-primary"
                      style={{ opacity: 0 }}
                    />
                  );
                })}
              </svg>
            </div>
            <p className="text-muted-foreground mt-3 font-mono text-[0.6875rem] tracking-wider uppercase">
              {sourceCredit}
            </p>
          </div>

          {/* Copy column — flips between intro state and diagnosis state */}
          <div className="relative">
            {/* Intro / annotation list state */}
            <div className="flex flex-col gap-6">
              <p
                ref={eyebrowRef}
                className="text-primary font-mono text-xs tracking-[0.2em] uppercase"
              >
                Case 001 · the lesion you just saw
              </p>
              <p
                ref={introRef}
                className="font-display text-foreground text-3xl leading-tight md:text-4xl"
              >
                Here’s what a trained eye catches.
              </p>

              {/* ABCDE annotation labels — animate in alongside circles, fade
                  out together at beat 5 so the diagnosis lockup can claim the
                  right column without text overlap. */}
              <ul ref={annotationListRef} className="flex flex-col gap-2">
                {ANNOTATIONS.map((a, i) => (
                  <li
                    key={a.letter}
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    className="flex items-baseline gap-3"
                    style={{ opacity: 0 }}
                  >
                    <span className="text-primary font-mono text-sm tabular-nums">
                      {a.letter}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {a.reasoning}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diagnosis state — overlays once intro has faded */}
            <div
              ref={diagnosisRef}
              className="absolute inset-0 flex flex-col gap-4"
              style={{ opacity: 0 }}
            >
              <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
                Diagnosis
              </p>
              <h3 className="font-display text-foreground text-5xl leading-[1.05] md:text-6xl">
                {DIAGNOSIS}
              </h3>
              <p
                ref={teachingRef}
                className="text-muted-foreground text-base leading-relaxed"
                style={{ opacity: 0 }}
              >
                {TEACHING}
              </p>
            </div>
          </div>
        </div>

        {/* Progress is expressed globally by the ScrollRail playhead — no
            local indicator inside the centerpiece. Removing it lets the
            pinned image command the full viewport. */}
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

const CenterpieceStatic = ({
  imageSrc,
  imageAlt,
  sourceCredit,
  className,
}: Required<
  Pick<CenterpiecePinnedProps, 'imageSrc' | 'imageAlt' | 'sourceCredit'>
> &
  Pick<CenterpiecePinnedProps, 'className'>) => {
  return (
    <section
      id="how"
      data-slot="centerpiece-pinned"
      data-how-static
      className={cn('relative isolate w-full', className)}
      aria-label="How a Pigmemento case works"
    >
      <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 py-20 md:grid-cols-[1fr_1fr] md:py-28">
        <div>
          <div className="border-hairline shadow-cinematic dark:surface-card-dark relative aspect-[4/5] w-full overflow-hidden rounded-card border bg-muted/30">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {ANNOTATIONS.map((a) => {
                const [x, y] = a.centerPoint;
                return (
                  <circle
                    key={a.letter}
                    cx={x * 100}
                    cy={y * 100}
                    r={5.5}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.4}
                    vectorEffect="non-scaling-stroke"
                    className="text-primary"
                  />
                );
              })}
            </svg>
          </div>
          <p className="text-muted-foreground mt-3 font-mono text-[0.6875rem] tracking-wider uppercase">
            {sourceCredit}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            Case 001 · the lesion you just saw
          </p>
          <p className="font-display text-foreground text-3xl leading-tight md:text-4xl">
            Here’s what a trained eye catches.
          </p>

          <ul className="flex flex-col gap-2">
            {ANNOTATIONS.map((a) => (
              <li key={a.letter} className="flex items-baseline gap-3">
                <span className="text-primary font-mono text-sm tabular-nums">
                  {a.letter}
                </span>
                <span className="text-muted-foreground text-sm">
                  {a.reasoning}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-hairline mt-2 flex flex-col gap-2 border-t pt-6">
            <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
              Diagnosis
            </p>
            <h3 className="font-display text-foreground text-5xl leading-[1.05]">
              {DIAGNOSIS}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {TEACHING}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
