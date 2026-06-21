import { describe, it, expect } from 'vitest';

import { shouldRender3D, type Render3DCapabilities } from './should-render-3d';

// A capable desktop: every gate passes. Each test flips exactly one gate to
// prove that gate alone forces the static fallback.
const capable: Render3DCapabilities = {
  hasWebGL2: true,
  prefersReducedMotion: false,
  prefersReducedData: false,
  isPhone: false,
};

describe('shouldRender3D', () => {
  it('renders 3D on a fully capable desktop', () => {
    expect(shouldRender3D(capable)).toBe(true);
  });

  it('falls back to static when WebGL2 is unavailable', () => {
    expect(shouldRender3D({ ...capable, hasWebGL2: false })).toBe(false);
  });

  it('falls back to static under prefers-reduced-motion', () => {
    expect(shouldRender3D({ ...capable, prefersReducedMotion: true })).toBe(
      false,
    );
  });

  it('falls back to static under Save-Data / prefers-reduced-data', () => {
    expect(shouldRender3D({ ...capable, prefersReducedData: true })).toBe(
      false,
    );
  });

  it('falls back to static on a phone (coarse pointer + small viewport)', () => {
    expect(shouldRender3D({ ...capable, isPhone: true })).toBe(false);
  });

  it('falls back to static when several gates fail at once', () => {
    expect(
      shouldRender3D({
        hasWebGL2: false,
        prefersReducedMotion: true,
        prefersReducedData: true,
        isPhone: true,
      }),
    ).toBe(false);
  });

  it('requires WebGL2 even when every other gate passes', () => {
    // Guards against an accidental OR: no single passing gate can rescue a
    // missing hard requirement.
    expect(shouldRender3D({ ...capable, hasWebGL2: false })).toBe(false);
  });
});
