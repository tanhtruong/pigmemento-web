/**
 * Capped prefetch for route `clientLoader`s (#60).
 *
 * Folds loading into the Develop instead of a spinner-then-jump:
 *  - Cached data resolves instantly → the surface reveals with no wait.
 *  - A brief cache miss holds navigation just long enough for the Develop's
 *    held beat (the outgoing surface dims; the wash covers a descend).
 *  - A genuinely slow fetch hits the cap, so navigation completes and the
 *    surface mounts showing a developing skeleton rather than blocking behind
 *    an indefinite hold.
 *
 * Prefetch errors are swallowed here — the surface's own query owns the error
 * state; the loader governs only timing.
 */
export const PREFETCH_CAP_MS = 600;

export const prefetchWithCap = async (
  prefetch: Promise<unknown>,
  capMs: number = PREFETCH_CAP_MS,
): Promise<null> => {
  await Promise.race([
    prefetch.catch(() => undefined),
    new Promise((resolve) => {
      setTimeout(resolve, capMs);
    }),
  ]);
  return null;
};
