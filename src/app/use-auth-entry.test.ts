import { describe, it, expect } from 'vitest';

import { resolveAuthEntry } from './use-auth-entry';

describe('resolveAuthEntry', () => {
  it('routes a signed-out commit through the auth panel', () => {
    expect(resolveAuthEntry(false)).toEqual({
      kind: 'enter-auth',
      destination: '/auth/login',
    });
  });

  it('lets a signed-in commit re-enter the app directly (Tier 2 ceremony)', () => {
    expect(resolveAuthEntry(true)).toEqual({
      kind: 'enter-app',
      destination: '/app/dashboard',
    });
  });
});
