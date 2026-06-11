import { describe, it, expect } from 'vitest';

import { findForbiddenGsapChunks } from './bundle-guard';

describe('findForbiddenGsapChunks', () => {
  it('returns no violations for an empty chunk list', () => {
    expect(findForbiddenGsapChunks([])).toEqual([]);
  });

  it('allows gsap to appear in a landing-* chunk', () => {
    expect(
      findForbiddenGsapChunks([
        {
          fileName: 'landing-abc123.js',
          code: 'gsap.registerPlugin(ScrollTrigger);',
        },
      ]),
    ).toEqual([]);
  });

  it('reports gsap leaking into an /app/* chunk', () => {
    expect(
      findForbiddenGsapChunks([
        { fileName: 'dashboard-xyz.js', code: 'gsap.timeline()' },
      ]),
    ).toEqual(['dashboard-xyz.js']);
  });

  it('does not flag /app/* chunks that are gsap-free', () => {
    expect(
      findForbiddenGsapChunks([
        { fileName: 'dashboard-xyz.js', code: 'const x = 1; export { x };' },
        { fileName: 'profile-abc.js', code: 'useQuery(...)' },
      ]),
    ).toEqual([]);
  });

  it('allows a gsap-* vendor chunk to contain gsap', () => {
    expect(
      findForbiddenGsapChunks([
        { fileName: 'gsap-vendor-xyz.js', code: 'gsap.timeline()' },
      ]),
    ).toEqual([]);
  });

  it('reports every violating chunk, not just the first', () => {
    expect(
      findForbiddenGsapChunks([
        { fileName: 'landing-ok.js', code: 'gsap.registerPlugin(...)' },
        { fileName: 'dashboard-bad.js', code: 'gsap.from(...)' },
        { fileName: 'cases-also-bad.js', code: 'ScrollTrigger.create(...)' },
        { fileName: 'profile-clean.js', code: 'no leaks here' },
      ]),
    ).toEqual(['dashboard-bad.js', 'cases-also-bad.js']);
  });
});
