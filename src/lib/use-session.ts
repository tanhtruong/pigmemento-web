import { useSyncExternalStore } from 'react';

import { subscribe, getSnapshot, type SessionSnapshot } from '@/lib/session';

/**
 * Reactive view of the Session (#122). Re-renders the caller on login, logout,
 * or a cross-tab token change — so a logout in the avatar menu propagates live to
 * the header and the route guard, instead of waiting for a refresh.
 */
export const useSession = (): SessionSnapshot =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
