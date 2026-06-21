import { Suspense, lazy, useRef } from 'react';

import { AnnotatedLesionImage } from '@/components/signature/annotated-lesion-image.tsx';
import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';
import { useRenderLoopActive, useShouldRender3D } from '@/lib/render-3d';
import { useMountedAfterPaint } from './use-mounted-after-paint';

// Lazy so three/r3f/drei land in the quarantined async `r3f-scene` chunk that
// the bundle guard (#126) allowlists — never the landing first-paint bundle.
const R3fScene = lazy(() => import('./r3f-scene'));

type CaseStageProps = {
  imageSrc: string;
  imageAlt: string;
  features?: AbcdeFeature[];
  sourceCredit?: string;
};

/**
 * The `/next` case-stage — one layout, two fidelities (#125).
 *
 * The static AnnotatedLesionImage is the floor: the real, accessible, indexable
 * content, always rendered. On a capable desktop (every `shouldRender3D` gate
 * passes) and only after first paint, a decorative 3D "specimen on the stage"
 * mounts over the 4:5 image frame; the ABCDE labels + credit beneath stay
 * visible. Under jsdom / any failing gate, only the static layer renders.
 */
export const CaseStage = ({
  imageSrc,
  imageAlt,
  features,
  sourceCredit,
}: CaseStageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const capable = useShouldRender3D();
  const paintedOnce = useMountedAfterPaint();
  const active = useRenderLoopActive(containerRef);
  const show3D = capable && paintedOnce;

  return (
    <div ref={containerRef} className="relative">
      <AnnotatedLesionImage
        src={imageSrc}
        alt={imageAlt}
        features={features}
        aspect="4:5"
        sourceCredit={sourceCredit}
      />
      {show3D && (
        <Suspense fallback={null}>
          {/* Overlays only the 4:5 frame (matches AnnotatedLesionImage's
              aspect + radius). The static layer underneath is the Suspense
              fallback while the scene chunk loads. */}
          <R3fScene
            imageSrc={imageSrc}
            active={active}
            className="rounded-card absolute inset-x-0 top-0 aspect-[4/5] overflow-hidden"
          />
        </Suspense>
      )}
    </div>
  );
};
