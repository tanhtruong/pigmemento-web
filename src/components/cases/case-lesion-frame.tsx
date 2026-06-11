import { type ReactNode } from 'react';

type CaseLesionFrameProps = {
  imageSrc: string;
  imageAlt: string;
  overlay?: ReactNode;
};

/**
 * Wraps the lesion image in a consistent layout container so /case-attempt and
 * /case-review render it at predictable coordinates. The `overlay` slot is
 * where the answer-reveal sweep + verdict block live on /case-review.
 */
export const CaseLesionFrame = ({
  imageSrc,
  imageAlt,
  overlay,
}: CaseLesionFrameProps) => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-card">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="block h-auto w-full object-cover"
        loading="eager"
        decoding="async"
      />
      {overlay}
    </div>
  );
};
