import { useState, useSyncExternalStore } from 'react';

import { shouldRender3D } from './should-render-3d';
import { useMediaQuery } from './use-media-query';

// Phone = coarse pointer on a small viewport. Matches the repo's 768px mobile
// breakpoint (see src/hooks/use-mobile.ts). A desktop touchscreen (coarse but
// wide) or a narrow desktop window (fine pointer) is deliberately not a phone.
const PHONE_QUERY = '(pointer: coarse) and (max-width: 768px)';

/**
 * One-shot probe: can the browser create a WebGL2 context? Constant per
 * session, so callers cache it (see `useWebGL2Support`). jsdom has no WebGL, so
 * this is `false` in tests — the static fallback path.
 */
export const detectWebGL2 = (): boolean => {
  if (typeof document === 'undefined') return false;
  try {
    return document.createElement('canvas').getContext('webgl2') != null;
  } catch {
    return false;
  }
};

type NavigatorConnection = {
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

const getConnection = (): NavigatorConnection | undefined =>
  typeof navigator !== 'undefined'
    ? (navigator as Navigator & { connection?: NavigatorConnection }).connection
    : undefined;

/** Chrome surfaces the `Save-Data` header via `navigator.connection.saveData`. */
const useSaveData = (): boolean =>
  useSyncExternalStore(
    (onStoreChange) => {
      const connection = getConnection();
      connection?.addEventListener?.('change', onStoreChange);
      return () => connection?.removeEventListener?.('change', onStoreChange);
    },
    () => Boolean(getConnection()?.saveData),
    () => false,
  );

/** WebGL2 support is constant for a session — probe once on mount. */
export const useWebGL2Support = (): boolean => {
  const [supported] = useState(detectWebGL2);
  return supported;
};

export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Save-Data intent from either the standard `prefers-reduced-data` query or the
 * older `navigator.connection.saveData` flag.
 */
export const usePrefersReducedData = (): boolean => {
  const reducedDataQuery = useMediaQuery('(prefers-reduced-data: reduce)');
  const saveData = useSaveData();
  return reducedDataQuery || saveData;
};

/** A phone: coarse pointer on a small (≤768px) viewport. */
export const useIsPhone = (): boolean => useMediaQuery(PHONE_QUERY);

/**
 * Composes the four capability hooks through the pure `shouldRender3D` gate.
 * Returns `true` only on a capable desktop where every gate passes; `false`
 * (static fallback) otherwise — including under jsdom, where WebGL2 is absent.
 */
export const useShouldRender3D = (): boolean => {
  const hasWebGL2 = useWebGL2Support();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersReducedData = usePrefersReducedData();
  const isPhone = useIsPhone();

  return shouldRender3D({
    hasWebGL2,
    prefersReducedMotion,
    prefersReducedData,
    isPhone,
  });
};
