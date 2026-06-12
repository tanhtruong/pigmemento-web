import { useMemo } from 'react';

type ChunkLoader = () => Promise<unknown>;

/**
 * Loaders that have already been warmed this session. Module-level so the
 * once-guard holds across every consumer of the same loader — hovering the
 * hero CTA and then the FAB must not double-import the auth chunk.
 */
const warmed = new WeakSet<ChunkLoader>();

/**
 * Warm a lazy route chunk on hover/focus intent so the conductor's bloom
 * never has to hold at apex waiting for a cold import. Spread the returned
 * handlers onto the CTA: `<Link {...usePrefetchOnHoverFocus(loader)} />`.
 */
export const usePrefetchOnHoverFocus = (loader: ChunkLoader) => {
  return useMemo(() => {
    const warm = () => {
      if (warmed.has(loader)) return;
      warmed.add(loader);
      void loader();
    };
    return { onMouseEnter: warm, onFocus: warm };
  }, [loader]);
};
