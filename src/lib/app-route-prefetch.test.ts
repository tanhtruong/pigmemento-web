import { describe, it, expect } from 'vitest';

import { matchAppRoutePrefetchKey } from './app-route-prefetch';

describe('matchAppRoutePrefetchKey', () => {
  it.each([
    ['/app/dashboard', 'dashboard'],
    ['/app/cases', 'cases'],
    ['/app/cases/random/attempt', 'case-random'],
    ['/app/cases/42/attempt', 'case-attempt'],
    ['/app/cases/drill', 'case-drill'],
    ['/app/profile', 'profile'],
  ])('maps %s to the %s chunk', (path, key) => {
    expect(matchAppRoutePrefetchKey(path)).toBe(key);
  });

  it('ignores a query string on the destination', () => {
    expect(matchAppRoutePrefetchKey('/app/dashboard?tab=streak')).toBe(
      'dashboard',
    );
  });

  it('returns null for anything outside the app shell', () => {
    expect(matchAppRoutePrefetchKey('/auth/login')).toBeNull();
    expect(matchAppRoutePrefetchKey('/')).toBeNull();
    expect(matchAppRoutePrefetchKey('/app/unknown')).toBeNull();
  });
});
