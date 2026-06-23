// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { AxiosError } from 'axios';

import { isSessionEndingAuthError } from './axios';
import { setToken } from './session';

const authError = (status: number, url: string): AxiosError =>
  new AxiosError('boom', 'ERR', { url } as never, undefined, {
    status,
  } as never);

afterEach(() => {
  localStorage.clear();
});

describe('isSessionEndingAuthError', () => {
  it('is true for a 401 on an authenticated request while a token is present', () => {
    setToken('jwt-ish');
    expect(isSessionEndingAuthError(authError(401, '/me'))).toBe(true);
  });

  it('is false without a token (already signed out — nothing to end)', () => {
    expect(isSessionEndingAuthError(authError(401, '/me'))).toBe(false);
  });

  it('is false on the login/register endpoints (bad credentials, not a dead session)', () => {
    setToken('jwt-ish');
    expect(isSessionEndingAuthError(authError(401, '/auth/login'))).toBe(false);
    expect(isSessionEndingAuthError(authError(401, '/auth/register'))).toBe(
      false,
    );
  });

  it('is false for a 403 (authenticated but not allowed)', () => {
    setToken('jwt-ish');
    expect(isSessionEndingAuthError(authError(403, '/me'))).toBe(false);
  });

  it('is false for a non-axios error', () => {
    setToken('jwt-ish');
    expect(isSessionEndingAuthError(new Error('network'))).toBe(false);
  });
});
