import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

vi.mock('@/lib/axios.ts', () => ({
  default: { get: vi.fn() },
}));

import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { useRandomCasePeek } from './use-random-case-peek';

const mockedGet = vi.mocked(api.get);

const stubCase = {
  id: 'peek-9',
  imageUrl: '/lesion-9.png',
  site: 'leg',
  patientAge: 51,
  clinicalNote: 'A peeked lesion.',
};

const makeWrapper = () => {
  const config: QueryClientConfig = {
    defaultOptions: { queries: { retry: false } },
  };
  const client = new QueryClient(config);
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

beforeEach(() => {
  mockedGet.mockReset();
});

describe('useRandomCasePeek (#100)', () => {
  it('looks one case ahead on mount — primes the next random case', async () => {
    mockedGet.mockResolvedValue({ data: stubCase });
    const { wrapper } = makeWrapper();

    renderHook(() => useRandomCasePeek(), { wrapper });

    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/cases/random'),
    );
  });

  it('promotes the peeked case instantly into the live cache, then warms the next', async () => {
    mockedGet.mockResolvedValue({ data: stubCase });
    const { client, wrapper } = makeWrapper();

    const { result } = renderHook(() => useRandomCasePeek(), { wrapper });

    // Once the peek has landed, promoting it seeds the live random-case query
    // with no fetch — the next case is already here.
    await waitFor(() => expect(result.current.promoteNext()).toBe(true));
    expect(client.getQueryData(queryKeys['random-case'])).toEqual(stubCase);

    // And it warms the following case so the rotation stays one ahead.
    await waitFor(() =>
      expect(mockedGet.mock.calls.length).toBeGreaterThanOrEqual(2),
    );
  });

  it('reports not-ready (falls back to a live fetch) when no peek has landed yet', () => {
    // A peek that never resolves — nothing is ready to promote.
    mockedGet.mockReturnValue(new Promise(() => {}) as never);
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useRandomCasePeek(), { wrapper });

    expect(result.current.promoteNext()).toBe(false);
    expect(mockedGet).toHaveBeenCalledWith('/cases/random');
  });
});
