import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  detectWebGL2,
  useIsPhone,
  usePrefersReducedData,
  usePrefersReducedMotion,
  useShouldRender3D,
} from './use-capabilities';

const originalMatchMedia = window.matchMedia;

// Make `window.matchMedia` report `matches: true` for any query the predicate
// accepts. The default jsdom stub (src/testing/setup.ts) reports everything false.
const mockMatchMedia = (matches: (query: string) => boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const stubWebGL2 = (supported: boolean) =>
  vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue((supported ? {} : null) as never);

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('detectWebGL2', () => {
  it('is false under jsdom (no WebGL)', () => {
    expect(detectWebGL2()).toBe(false);
  });

  it('is true when a webgl2 context can be created', () => {
    stubWebGL2(true);
    expect(detectWebGL2()).toBe(true);
  });
});

describe('useShouldRender3D', () => {
  it('is false under jsdom because WebGL2 is unavailable', () => {
    const { result } = renderHook(() => useShouldRender3D());
    expect(result.current).toBe(false);
  });

  it('is true on a capable desktop: WebGL2 present, no reduce/phone signals', () => {
    stubWebGL2(true);
    mockMatchMedia(() => false);
    const { result } = renderHook(() => useShouldRender3D());
    expect(result.current).toBe(true);
  });

  it.each([
    ['(prefers-reduced-motion: reduce)'],
    ['(prefers-reduced-data: reduce)'],
    ['(pointer: coarse)'],
  ])('falls back to static when %s matches (with WebGL2 present)', (needle) => {
    stubWebGL2(true);
    mockMatchMedia((query) => query.includes(needle));
    const { result } = renderHook(() => useShouldRender3D());
    expect(result.current).toBe(false);
  });
});

describe('individual capability hooks read matchMedia', () => {
  it('usePrefersReducedMotion reflects the media query', () => {
    mockMatchMedia((q) => q.includes('prefers-reduced-motion'));
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(
      true,
    );
  });

  it('usePrefersReducedData reflects the media query', () => {
    mockMatchMedia((q) => q.includes('prefers-reduced-data'));
    expect(renderHook(() => usePrefersReducedData()).result.current).toBe(true);
  });

  it('useIsPhone reflects the coarse-pointer + small-viewport query', () => {
    mockMatchMedia((q) => q.includes('pointer: coarse'));
    expect(renderHook(() => useIsPhone()).result.current).toBe(true);
  });
});
