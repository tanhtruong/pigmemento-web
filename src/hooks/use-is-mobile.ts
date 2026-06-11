import { useEffect, useState } from 'react';

/**
 * Returns `true` when the viewport is below Tailwind's `md` breakpoint (768px).
 * Used by AppStartACaseButton to swap a Popover for a vaul Drawer per platform
 * convention.
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};
