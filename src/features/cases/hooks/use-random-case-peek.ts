import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import type { CaseDetail } from '@/features/cases/types/case-detail.ts';

/**
 * Decode the next lesion off-DOM so the Handoff crossfade (#99) never waits on a
 * decode. Best-effort: a browser without `HTMLImageElement.decode` (jsdom) or a
 * decode that rejects must not block the rotation.
 */
const decodeImage = async (url?: string): Promise<void> => {
  if (!url || typeof Image === 'undefined') return;
  const img = new Image();
  img.src = url;
  try {
    await img.decode?.();
  } catch {
    // Decode is an optimisation, never a gate.
  }
};

/**
 * useRandomCasePeek (#100) — keeps the random practice loop one case ahead.
 *
 * `/cases/random` is a side-effect-free read, so the moment the surface mounts
 * (and again after every promotion) we quietly fetch and decode the *next*
 * random case into a peek slot. `promoteNext` then seeds the live random-case
 * query with the already-decoded case — no fetch, no decode wait — so the
 * Handoff fires instantly. When no peek has landed yet it returns false, letting
 * the caller fall back to a live refetch (the #99 held lightbox covers it).
 */
export const useRandomCasePeek = () => {
  const queryClient = useQueryClient();
  const peekRef = useRef<CaseDetail | null>(null);
  const inFlightRef = useRef(false);

  const primePeek = useCallback(async () => {
    if (peekRef.current || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const res = await api.get<CaseDetail>('/cases/random');
      await decodeImage(res.data?.imageUrl);
      peekRef.current = res.data;
    } catch {
      // A failed peek leaves the slot empty; promoteNext falls back to a live
      // fetch. The rotation never breaks on a peek error.
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    void primePeek();
  }, [primePeek]);

  const promoteNext = useCallback((): boolean => {
    const next = peekRef.current;
    if (!next) {
      void primePeek();
      return false;
    }
    peekRef.current = null;
    queryClient.setQueryData(queryKeys['random-case'], next);
    void primePeek();
    return true;
  }, [primePeek, queryClient]);

  return { promoteNext };
};
