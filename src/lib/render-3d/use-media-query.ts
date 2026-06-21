import { useCallback, useSyncExternalStore } from 'react';

const hasMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * Reactive `window.matchMedia` boolean, read the React-Compiler-safe way via
 * useSyncExternalStore — no useEffect/setState (which `react-hooks/
 * set-state-in-effect` flags) and no initial `undefined → value` flash, so a
 * capability gate is correct on first paint. SSR / no-matchMedia resolves to
 * `false`.
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!hasMatchMedia()) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = () =>
    hasMatchMedia() ? window.matchMedia(query).matches : false;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};
