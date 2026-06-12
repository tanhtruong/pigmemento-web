// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { commitOrigin } from './commit-origin';

describe('commitOrigin', () => {
  it('returns the center of the element rect', () => {
    const el = document.createElement('button');
    el.getBoundingClientRect = () =>
      ({ left: 100, top: 200, width: 80, height: 40 }) as DOMRect;

    expect(commitOrigin(el)).toEqual({ x: 140, y: 220 });
  });

  it('falls back to the viewport center when the element is gone', () => {
    const { x, y } = commitOrigin(null);

    expect(x).toBe(window.innerWidth / 2);
    expect(y).toBe(window.innerHeight / 2);
  });
});
