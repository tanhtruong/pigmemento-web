import { useEffect, useState } from 'react';

/**
 * `false` on the first render, `true` after the first paint (next animation
 * frame). Lets the heavy 3D overlay defer until the static layer has painted,
 * so WebGL is pure progressive enhancement that never blocks first paint.
 */
export const useMountedAfterPaint = (): boolean => {
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPainted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return painted;
};
