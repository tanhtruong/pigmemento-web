import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './mocks/server';

// Mock Service Worker: intercept network in tests. Unhandled requests pass
// through ('bypass') so the many tests that mock @/lib/axios directly are
// unaffected; opt in per test via server.use(...) or by adding handlers in
// testing/mocks/handlers.ts.
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// GSAP is lazy-loaded (src/lib/lazy-gsap.ts) from landing-route modules via
// dynamic import(). In jsdom those imports can resolve after the test
// environment is torn down, surfacing noisy "Cannot load gsap/CSSPlugin.js
// after the environment was torn down" unhandled rejections (the tests still
// pass, but the errors are misleading). Stub gsap + ScrollTrigger with
// infinitely-chainable no-ops so the dynamic imports never touch the real
// files. Factories are self-contained because vi.mock is hoisted above the
// module body. No test asserts gsap behaviour (animations are visual no-ops
// in jsdom); the bundle guard is exercised separately via string fixtures.
vi.mock('gsap', () => {
  const make = (): unknown =>
    new Proxy(function () {}, {
      get: (_t, prop) => (prop === 'then' ? undefined : make()),
      apply: () => make(),
    });
  const gsap = make();
  return { default: gsap, gsap };
});

vi.mock('gsap/ScrollTrigger', () => {
  const make = (): unknown =>
    new Proxy(function () {}, {
      get: (_t, prop) => (prop === 'then' ? undefined : make()),
      apply: () => make(),
    });
  const ScrollTrigger = make();
  return { default: ScrollTrigger, ScrollTrigger };
});

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
