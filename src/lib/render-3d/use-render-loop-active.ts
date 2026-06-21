import {
  type RefObject,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

/**
 * True while the tab is visible. The 3D render loop pauses when this is false
 * so a backgrounded tab spends no GPU/battery.
 */
export const useDocumentVisible = (): boolean =>
  useSyncExternalStore(
    (onStoreChange) => {
      if (typeof document === 'undefined') return () => {};
      document.addEventListener('visibilitychange', onStoreChange);
      return () =>
        document.removeEventListener('visibilitychange', onStoreChange);
    },
    () =>
      typeof document === 'undefined'
        ? true
        : document.visibilityState === 'visible',
    () => true,
  );

/**
 * True while `ref`'s element intersects the viewport. Drives pausing the render
 * loop when the canvas scrolls off-screen. Starts `false` until the observer
 * reports — and stays `false` under jsdom's no-op IntersectionObserver.
 */
export const useIsIntersecting = <T extends Element>(
  ref: RefObject<T | null>,
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isIntersecting;
};

/**
 * The render loop should run only while the tab is visible AND the canvas is
 * on-screen — pause it otherwise. Combines the two signals #129's loop keys off.
 */
export const useRenderLoopActive = <T extends Element>(
  ref: RefObject<T | null>,
): boolean => {
  const isVisible = useDocumentVisible();
  const isIntersecting = useIsIntersecting(ref);
  return isVisible && isIntersecting;
};
