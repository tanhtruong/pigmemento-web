import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import {
  useDocumentVisible,
  useIsIntersecting,
  useRenderLoopActive,
} from './use-render-loop-active';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    configurable: true,
  });
});

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

// jsdom's default IntersectionObserver mock never fires. Install a controllable
// one so the intersect transition is determinable.
const installControllableIO = () => {
  let fire: (isIntersecting: boolean) => void = () => {};
  const observe = vi.fn();
  const disconnect = vi.fn();

  class ControllableIO {
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds: number[] = [];

    constructor(callback: IntersectionObserverCallback) {
      fire = (isIntersecting) =>
        callback(
          [{ isIntersecting } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
    }
  }

  vi.stubGlobal('IntersectionObserver', ControllableIO);
  return { fire: (v: boolean) => fire(v), observe, disconnect };
};

const elementRef = () => ({ current: document.createElement('div') });

describe('useDocumentVisible', () => {
  it('is true when the tab is visible (jsdom default)', () => {
    const { result } = renderHook(() => useDocumentVisible());
    expect(result.current).toBe(true);
  });

  it('flips to false when the tab is hidden, back to true when shown', () => {
    const { result } = renderHook(() => useDocumentVisible());
    act(() => setVisibility('hidden'));
    expect(result.current).toBe(false);
    act(() => setVisibility('visible'));
    expect(result.current).toBe(true);
  });
});

describe('useIsIntersecting', () => {
  it('starts false and follows the observer callback', () => {
    const io = installControllableIO();
    const ref = elementRef(); // stable across renders
    const { result } = renderHook(() => useIsIntersecting(ref));
    expect(result.current).toBe(false);
    expect(io.observe).toHaveBeenCalledTimes(1);
    act(() => io.fire(true));
    expect(result.current).toBe(true);
    act(() => io.fire(false));
    expect(result.current).toBe(false);
  });

  it('disconnects the observer on unmount', () => {
    const io = installControllableIO();
    const ref = elementRef();
    const { unmount } = renderHook(() => useIsIntersecting(ref));
    unmount();
    expect(io.disconnect).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when the ref holds no element', () => {
    const io = installControllableIO();
    const ref = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() => useIsIntersecting(ref));
    expect(result.current).toBe(false);
    expect(io.observe).not.toHaveBeenCalled();
  });
});

describe('useRenderLoopActive', () => {
  it('is false while the canvas has not intersected, even when visible', () => {
    installControllableIO();
    const ref = elementRef();
    const { result } = renderHook(() => useRenderLoopActive(ref));
    expect(result.current).toBe(false);
  });

  it('runs only when visible AND intersecting', () => {
    const io = installControllableIO();
    const ref = elementRef();
    const { result } = renderHook(() => useRenderLoopActive(ref));
    act(() => io.fire(true));
    expect(result.current).toBe(true);
    act(() => setVisibility('hidden'));
    expect(result.current).toBe(false);
    act(() => setVisibility('visible'));
    expect(result.current).toBe(true);
  });
});
