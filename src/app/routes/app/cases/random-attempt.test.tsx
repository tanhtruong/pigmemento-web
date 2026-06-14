import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/cases/api/use-case-random.ts', () => ({
  useRandomCase: vi.fn(),
  randomCaseQueryOptions: () => ({
    queryKey: ['random-case'],
    queryFn: vi.fn(),
  }),
}));

// The peek hook owns its own network; isolate the scene from it here (#100 is
// covered by use-random-case-peek.test.tsx).
vi.mock('@/features/cases/hooks/use-random-case-peek.ts', () => ({
  useRandomCasePeek: () => ({ promoteNext: () => false }),
}));

import { useRandomCase } from '@/features/cases/api/use-case-random.ts';

import RandomCaseScene from './random-attempt';

const mockedUseRandomCase = vi.mocked(useRandomCase);

const stubCase = {
  id: '7',
  imageUrl: '/lesion-7.png',
  site: 'arm',
  patientAge: 33,
  clinicalNote: 'A pigmented lesion.',
};

const renderScene = (result: Partial<ReturnType<typeof useRandomCase>>) => {
  mockedUseRandomCase.mockReturnValue(
    result as ReturnType<typeof useRandomCase>,
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RandomCaseScene />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

afterEach(() => {
  mockedUseRandomCase.mockReset();
});

describe('RandomCaseScene — the fixed lightbox never tears down (#99)', () => {
  it('holds the case on screen while the next one refetches — no skeleton flash', () => {
    // A warm next-case: data is still present (the current/just-promoted case)
    // while the query refetches in the background. isLoading is false.
    renderScene({ data: stubCase as never, isLoading: false, isError: false });

    expect(screen.queryByLabelText('Loading case')).toBeNull();
    expect(screen.getByText('What do you see?')).toBeInTheDocument();
  });

  it('shows the skeleton only on the genuine first load with no case yet', () => {
    renderScene({ data: undefined, isLoading: true, isError: false });

    expect(screen.getByLabelText('Loading case')).toBeInTheDocument();
  });
});
