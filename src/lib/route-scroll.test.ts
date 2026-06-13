import { describe, it, expect } from 'vitest';

import {
  rememberScroll,
  restoresScroll,
  scrollTargetFor,
} from './route-scroll';

describe('restoresScroll', () => {
  it('restores on back/ascend hops', () => {
    expect(restoresScroll('ascend')).toBe(true);
    expect(restoresScroll('lateral-back')).toBe(true);
  });

  it('starts fresh on forward/descend/advance/neutral/none', () => {
    expect(restoresScroll('lateral-forward')).toBe(false);
    expect(restoresScroll('descend')).toBe(false);
    expect(restoresScroll('advance')).toBe(false);
    expect(restoresScroll('neutral')).toBe(false);
    expect(restoresScroll('none')).toBe(false);
  });
});

describe('rememberScroll + scrollTargetFor', () => {
  it('returns the saved position on a restoring hop', () => {
    rememberScroll('/app/cases', 420);
    expect(scrollTargetFor('/app/cases', true)).toBe(420);
  });

  it('returns top when not restoring, even with a saved position', () => {
    rememberScroll('/app/cases', 420);
    expect(scrollTargetFor('/app/cases', false)).toBe(0);
  });

  it('returns top for a surface never visited', () => {
    expect(scrollTargetFor('/app/never-seen', true)).toBe(0);
  });
});
