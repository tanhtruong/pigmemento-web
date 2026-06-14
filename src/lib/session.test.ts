import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('jwt-decode', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jwt-decode')>();
  return { jwtDecode: vi.fn(actual.jwtDecode) };
});

import { jwtDecode } from 'jwt-decode';
import {
  getToken,
  setToken,
  clearToken,
  getSnapshot,
  subscribe,
  isAuthenticated,
} from './session';

const mockedDecode = vi.mocked(jwtDecode);

const CLAIM = {
  id: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
};

const base64url = (obj: unknown) =>
  btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const token = (over: Record<string, unknown> = {}) =>
  `header.${base64url({
    exp: Math.floor(Date.now() / 1000) + 3600,
    sub: 'sub-1',
    [CLAIM.id]: 'user-1',
    [CLAIM.name]: 'Dr. Fent',
    [CLAIM.email]: 'fh@pigmemento.app',
    ...over,
  })}.sig`;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('session', () => {
  it('reports unauthenticated with no token', () => {
    expect(getToken()).toBeNull();
    expect(getSnapshot().status).toBe('unauthenticated');
    expect(isAuthenticated()).toBe(false);
  });

  it('reflects a valid token as an authenticated identity', () => {
    setToken(token());
    const snap = getSnapshot();
    expect(snap.status).toBe('authenticated');
    expect(snap.user).toEqual({
      id: 'user-1',
      name: 'Dr. Fent',
      email: 'fh@pigmemento.app',
    });
    expect(getToken()).toBe(token());
  });

  it('treats an expired token as unauthenticated (lazy expiry)', () => {
    setToken(token({ exp: Math.floor(Date.now() / 1000) - 1 }));
    expect(getSnapshot().status).toBe('unauthenticated');
  });

  it('clears back to unauthenticated', () => {
    setToken(token());
    expect(isAuthenticated()).toBe(true);
    clearToken();
    expect(getSnapshot().status).toBe('unauthenticated');
    expect(getToken()).toBeNull();
  });

  it('notifies subscribers on set and clear', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    setToken(token());
    clearToken();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('decodes the token once per change, not per read', () => {
    setToken(token());
    getSnapshot();
    getSnapshot();
    getSnapshot();
    expect(mockedDecode).toHaveBeenCalledTimes(1);
  });

  it('returns a stable snapshot reference while unchanged', () => {
    setToken(token());
    expect(getSnapshot()).toBe(getSnapshot());
  });
});
