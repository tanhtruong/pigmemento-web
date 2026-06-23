// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { commitOrigin, gestureOrigin } from './commit-origin';

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

describe('gestureOrigin', () => {
  const elementAt = (left: number, top: number) => {
    const el = document.createElement('a');
    el.getBoundingClientRect = () =>
      ({ left, top, width: 60, height: 30 }) as DOMRect;
    return el;
  };

  it('uses the pointer position for mouse and touch clicks', () => {
    const origin = gestureOrigin({
      clientX: 333,
      clientY: 444,
      currentTarget: elementAt(0, 0),
    });

    expect(origin).toEqual({ x: 333, y: 444 });
  });

  it('uses the element center for keyboard activation (coords are 0,0)', () => {
    const origin = gestureOrigin({
      clientX: 0,
      clientY: 0,
      currentTarget: elementAt(200, 400),
    });

    expect(origin).toEqual({ x: 230, y: 415 });
  });
});
