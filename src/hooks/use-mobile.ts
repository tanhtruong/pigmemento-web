import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

export function useIsMobile() {
  // useSyncExternalStore is the React-Compiler-safe way to read a media
  // query: it replaces the previous useEffect + setState pattern (which the
  // react-hooks/set-state-in-effect rule flags) and avoids the initial
  // undefined→value flash. The server snapshot mirrors the old `!!undefined`.
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  );
}
