import { describe, it, expect } from 'vitest';

import {
  findForbiddenGsapChunks,
  findForbiddenThreeChunks,
} from './bundle-guard';

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

describe('findForbiddenThreeChunks', () => {
  it('returns no violations for an empty chunk list', () => {
    expect(findForbiddenThreeChunks([])).toEqual([]);
  });

  it('allows three/r3f to live in the three-vendor chunk', () => {
    expect(
      findForbiddenThreeChunks([
        {
          fileName: 'three-vendor-abc123.js',
          code: 'class WebGLRenderer{}/* THREE.WebGLRenderer */',
        },
      ]),
    ).toEqual([]);
  });

  it('allows an async r3f-* scene chunk to import the three-vendor chunk', () => {
    expect(
      findForbiddenThreeChunks([
        {
          fileName: 'r3f-scene-abc123.js',
          code: 'import{c as t}from"./three-vendor-abc123.js";',
        },
      ]),
    ).toEqual([]);
  });

  it('reports three leaking into an /app/* chunk via the three-vendor import', () => {
    expect(
      findForbiddenThreeChunks([
        {
          fileName: 'dashboard-xyz.js',
          code: 'import{c as t}from"./three-vendor-abc123.js";',
        },
      ]),
    ).toEqual(['dashboard-xyz.js']);
  });

  it('reports three reaching the landing first-paint chunk (stricter than gsap)', () => {
    expect(
      findForbiddenThreeChunks([
        { fileName: 'landing-abc.js', code: 'new THREE.Scene()' },
      ]),
    ).toEqual(['landing-abc.js']);
  });

  it('reports a chunk that pulls in @react-three directly', () => {
    expect(
      findForbiddenThreeChunks([
        { fileName: 'cases-bad.js', code: 'from"@react-three/fiber"' },
      ]),
    ).toEqual(['cases-bad.js']);
  });

  it('does not flag chunks that merely use the English word "three"', () => {
    expect(
      findForbiddenThreeChunks([
        {
          fileName: 'landing-copy.js',
          code: 'The medial border is irregular, with three colors.',
        },
        { fileName: 'dashboard-clean.js', code: 'const threshold = 3;' },
      ]),
    ).toEqual([]);
  });

  it('reports every violating chunk, not just the first', () => {
    expect(
      findForbiddenThreeChunks([
        { fileName: 'three-vendor-ok.js', code: 'THREE.Scene' },
        {
          fileName: 'dashboard-bad.js',
          code: 'import"./three-vendor-x.js"',
        },
        { fileName: 'profile-also-bad.js', code: 'new THREE.WebGLRenderer()' },
        { fileName: 'cases-clean.js', code: 'no leaks here' },
      ]),
    ).toEqual(['dashboard-bad.js', 'profile-also-bad.js']);
  });
});
