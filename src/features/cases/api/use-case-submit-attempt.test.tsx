import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

vi.mock('@/lib/axios.ts', () => ({
  default: { post: vi.fn() },
}));

import api from '@/lib/axios.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { useCaseSubmitAttempt } from './use-case-submit-attempt';

const mockedPost = vi.mocked(api.post);

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
  mockedPost.mockReset();
});

describe('useCaseSubmitAttempt', () => {
  it('seeds the latest-attempt cache from the answer so the review renders without refetching', async () => {
    mockedPost.mockResolvedValue({
      data: {
        correct: false,
        correctLabel: 'malignant',
        teachingPoints: ['Asymmetry is the tell here.'],
        disclaimer: 'Educational use only.',
      },
    });

    const { client, wrapper } = makeWrapper();
    const { result } = renderHook(() => useCaseSubmitAttempt(), { wrapper });

    result.current.mutate({
      caseId: 'case-7',
      attempt: { chosenLabel: 'benign', timeToAnswerMs: 4200 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(client.getQueryData(queryKeys['latest-attempt']('case-7'))).toEqual({
      correct: false,
      correctLabel: 'malignant',
      teachingPoints: ['Asymmetry is the tell here.'],
      disclaimer: 'Educational use only.',
      chosenLabel: 'benign',
      timeToAnswerMs: 4200,
    });
  });
});
