// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

import { endSession } from './end-session';
import { getToken, setToken } from './session';
import {
  rememberScroll,
  scrollTargetFor,
  clearScrollMemory,
} from './route-scroll';

afterEach(() => {
  localStorage.clear();
  clearScrollMemory();
});

describe('endSession', () => {
  it('tears down the whole session — token, scroll store, and query cache — and nothing else', () => {
    setToken('jwt-ish');
    rememberScroll('/app/cases', 320);
    const queryClient = new QueryClient();
    queryClient.setQueryData(['me'], { id: '1' });

    endSession(queryClient);

    expect(getToken()).toBeNull();
    // The scroll store is forgotten, so a restoring hop now lands at the top.
    expect(scrollTargetFor('/app/cases', true)).toBe(0);
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
    // No navigation side effect — the caller owns the route transition.
    expect(window.location.pathname).toBe('/');
  });
});
