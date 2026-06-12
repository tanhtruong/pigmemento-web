// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

import { performLogout } from './use-auth';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('performLogout', () => {
  it('clears the token and the query cache — nothing else', () => {
    localStorage.setItem('token', 'jwt-ish');
    const queryClient = new QueryClient();
    const clear = vi.spyOn(queryClient, 'clear');

    performLogout(queryClient);

    expect(localStorage.getItem('token')).toBeNull();
    expect(clear).toHaveBeenCalledTimes(1);
    // No navigation side effect — the caller owns the route transition
    // (the conductor's exit-app bloom drives it).
    expect(window.location.pathname).toBe('/');
  });
});
