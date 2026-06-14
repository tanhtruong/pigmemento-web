import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

vi.mock('@/lib/axios.ts', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

import api from '@/lib/axios.ts';
import { useAttempt } from './use-attempt';

const mockedPost = vi.mocked(api.post);
const mockedGet = vi.mocked(api.get);

const answer = {
  correct: false,
  correctLabel: 'malignant',
  teachingPoints: ['Asymmetry is the tell.'],
  disclaimer: 'Educational use only.',
};

const resolved = (over: Record<string, unknown> = {}) => ({
  data: { ...answer, chosenLabel: 'benign', timeToAnswerMs: 8000, ...over },
});

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
  mockedGet.mockReset();
});

describe('useAttempt', () => {
  it('starts at the question with nothing committed or resolved', () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAttempt('case-1'), { wrapper });

    expect(result.current.phase).toBe('question');
    expect(result.current.committed).toBeNull();
    expect(result.current.verdict).toBeNull();
  });

  it('commits, submits, and resolves to a live verdict', async () => {
    mockedPost.mockResolvedValue({ data: answer });
    mockedGet.mockResolvedValue(resolved());

    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useAttempt('case-1', { revealDelayMs: 0 }),
      { wrapper },
    );

    act(() => result.current.commit('benign'));
    expect(result.current.committed).toBe('benign');

    await waitFor(() => expect(result.current.phase).toBe('resolved'));
    expect(result.current.live).toBe(true);
    expect(result.current.verdict?.outcome).toBe('incorrect');
    expect(result.current.verdict?.diagnosis).toBe('Malignant');
    expect(mockedPost).toHaveBeenCalledOnce();
  });

  it('ignores a second commit once one is in flight', async () => {
    mockedPost.mockResolvedValue({ data: answer });
    mockedGet.mockResolvedValue(resolved());

    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useAttempt('case-1', { revealDelayMs: 0 }),
      { wrapper },
    );

    act(() => result.current.commit('benign'));
    act(() => result.current.commit('malignant'));

    await waitFor(() => expect(result.current.phase).toBe('resolved'));
    expect(result.current.committed).toBe('benign');
    expect(mockedPost).toHaveBeenCalledOnce();
  });

  it('retry returns to the question and clears the verdict', async () => {
    mockedPost.mockResolvedValue({ data: answer });
    mockedGet.mockResolvedValue(resolved());

    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useAttempt('case-1', { revealDelayMs: 0 }),
      { wrapper },
    );

    act(() => result.current.commit('benign'));
    await waitFor(() => expect(result.current.phase).toBe('resolved'));

    act(() => result.current.retry());
    expect(result.current.phase).toBe('question');
    expect(result.current.committed).toBeNull();
    expect(result.current.verdict).toBeNull();
  });

  it('resume opens an already-answered case at its verdict, composed static', async () => {
    mockedGet.mockResolvedValue(resolved({ timeToAnswerMs: 12000 }));

    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useAttempt('case-1', { resume: true }),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.phase).toBe('resolved'));
    expect(result.current.live).toBe(false);
    expect(result.current.verdict?.outcome).toBe('incorrect');
    expect(result.current.timeToAnswerMs).toBe(12000);
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
