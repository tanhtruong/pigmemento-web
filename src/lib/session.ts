import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';

type JwtPayload = {
  [key: string]: unknown;
  exp: number;
  sub: string;
};

/** The signed-in person, decoded from the session token (no network). */
export type Identity = {
  id: string;
  name: string;
  email: string;
};

export type SessionSnapshot = {
  status: 'authenticated' | 'unauthenticated';
  user: Identity | null;
};

const UNAUTHENTICATED: SessionSnapshot = {
  status: 'unauthenticated',
  user: null,
};

// The backend issues .NET-style claim URIs; this is the one place that knows them.
const CLAIM = {
  id: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
} as const;

const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const identityFrom = (decoded: JwtPayload): Identity => ({
  id: (decoded[CLAIM.id] as string) ?? decoded.sub,
  name: decoded[CLAIM.name] as string,
  email: decoded[CLAIM.email] as string,
});

// The token's decoded fields are cached per token string, so the JWT is decoded
// once per change rather than on every snapshot read; expiry is then a cheap
// numeric compare on each read, keeping the snapshot honest without re-decoding.
let decoded: { token: string; exp: number; identity: Identity } | null = null;
let snapshot: SessionSnapshot = UNAUTHENTICATED;

const getSnapshot = (): SessionSnapshot => {
  const token = readToken();

  if (!token) {
    decoded = null;
    if (snapshot.status !== 'unauthenticated') snapshot = UNAUTHENTICATED;
    return snapshot;
  }

  if (!decoded || decoded.token !== token) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      decoded = { token, exp: payload.exp, identity: identityFrom(payload) };
    } catch {
      decoded = null;
    }
  }

  // Lazy expiry: a token valid now goes invalid at `exp` with no event, so
  // re-check on every read. The snapshot reference stays stable until the
  // authenticated/unauthenticated state actually flips.
  const valid = decoded !== null && decoded.exp > Date.now() / 1000;

  if (valid) {
    if (
      snapshot.status === 'authenticated' &&
      snapshot.user === decoded!.identity
    ) {
      return snapshot;
    }
    snapshot = { status: 'authenticated', user: decoded!.identity };
    return snapshot;
  }

  if (snapshot.status !== 'unauthenticated') snapshot = UNAUTHENTICATED;
  return snapshot;
};

const listeners = new Set<() => void>();

const emitChange = (): void => {
  for (const listener of listeners) listener();
};

const onStorage = (event: StorageEvent): void => {
  // A login/logout in another tab replaces or removes the token (or storage is
  // cleared wholesale, key === null). Propagate so every tab agrees on the session.
  if (event.key === TOKEN_KEY || event.key === null) emitChange();
};

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', onStorage);
    }
  };
};

export { getSnapshot };

/** The raw bearer token, for the axios request interceptor. */
export const getToken = (): string | null => readToken();

/** Persist a new session token (login/register) and notify subscribers. */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn('Failed to persist auth token:', e);
  }
  emitChange();
};

/** Clear the session token (logout) and notify subscribers. */
export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to clear auth token:', e);
  }
  emitChange();
};

/** Imperative auth check for non-React callers; reactive readers use useSession. */
export const isAuthenticated = (): boolean =>
  getSnapshot().status === 'authenticated';
