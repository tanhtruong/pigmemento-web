import { useEffect, useState } from 'react';

/**
 * True on coarse-pointer devices (touch). The case flow uses it to gate the
 * keyboard shortcut grammar, which only makes sense with a real keyboard.
 */
export const useCoarsePointer = (): boolean => {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarse(Boolean(mq.matches));
    update();
    if ('addEventListener' in mq) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
  }, []);

  return isCoarse;
};
