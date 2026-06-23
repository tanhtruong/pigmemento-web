import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

vi.mock('@/lib/axios.ts', () => ({
  default: { patch: vi.fn() },
}));

import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { useUpdateProfile } from './use-update-profile';

const mockedPatch = vi.mocked(api.patch);

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
  mockedPatch.mockReset();
});

describe('useUpdateProfile', () => {
  it('invalidates the Profile (queryKeys.me) once settled, so the screen refreshes without a manual call', async () => {
    mockedPatch.mockResolvedValue({
      data: {
        id: '1',
        name: 'New Name',
        email: 'a@b.co',
        role: 'user',
        createdAt: '2026-01-01T00:00:00Z',
        lastLoginAt: null,
      },
    });

    const { client, wrapper } = makeWrapper();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({ name: 'New Name' });

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me }),
    );
  });
});
