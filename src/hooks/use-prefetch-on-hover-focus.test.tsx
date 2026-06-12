// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { usePrefetchOnHoverFocus } from './use-prefetch-on-hover-focus';

describe('usePrefetchOnHoverFocus', () => {
  it('fires the loader once across repeated hover and focus', () => {
    const loader = vi.fn(() => Promise.resolve({}));
    const { result } = renderHook(() => usePrefetchOnHoverFocus(loader));

    result.current.onMouseEnter();
    result.current.onFocus();
    result.current.onMouseEnter();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('shares the once-guard between consumers of the same loader', () => {
    const loader = vi.fn(() => Promise.resolve({}));
    const first = renderHook(() => usePrefetchOnHoverFocus(loader));
    const second = renderHook(() => usePrefetchOnHoverFocus(loader));

    first.result.current.onMouseEnter();
    second.result.current.onFocus();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('treats different loaders independently', () => {
    const loaderA = vi.fn(() => Promise.resolve({}));
    const loaderB = vi.fn(() => Promise.resolve({}));
    const a = renderHook(() => usePrefetchOnHoverFocus(loaderA));
    const b = renderHook(() => usePrefetchOnHoverFocus(loaderB));

    a.result.current.onMouseEnter();
    b.result.current.onMouseEnter();

    expect(loaderA).toHaveBeenCalledTimes(1);
    expect(loaderB).toHaveBeenCalledTimes(1);
  });
});
