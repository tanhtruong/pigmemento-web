import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom doesn't ship matchMedia; tests that touch it want a no-op default.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom doesn't ship IntersectionObserver. Components that use framer-motion's
// whileInView (e.g. landing route sections) need a no-op so render doesn't throw.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
}

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}
