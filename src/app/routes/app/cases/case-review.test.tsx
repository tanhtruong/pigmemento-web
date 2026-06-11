import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

vi.mock('@/features/cases/api/use-case.ts', () => ({
  useCase: vi.fn(),
}));
vi.mock('@/features/cases/api/use-case-latest-attempt.ts', () => ({
  useCaseLatestAttempt: vi.fn(),
}));

import { useReducedMotion } from 'motion/react';
import { useCase } from '@/features/cases/api/use-case.ts';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';

import CaseReviewScene from './case-review';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);
const mockedUseCase = vi.mocked(useCase);
const mockedUseLatestAttempt = vi.mocked(useCaseLatestAttempt);

const stubCase = {
  id: '42',
  imageUrl: '/lesion-42.png',
  difficulty: 'medium' as const,
  site: 'arm',
  patientAge: 42,
  clinicalNote: '...',
};

const stubAttempt = {
  correct: true,
  correctLabel: 'benign' as const,
  chosenLabel: 'benign' as const,
  timeToAnswerMs: 2000,
  teachingPoints: [],
  disclaimer: '',
};

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  mockedUseCase.mockReset();
  mockedUseLatestAttempt.mockReset();
});

const renderRoute = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/cases/42/review']}>
        <Routes>
          <Route
            path="/app/cases/:caseId/review"
            element={<CaseReviewScene />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('CaseReviewScene', () => {
  it('renders the AnswerRevealSweep over the lesion under normal motion', () => {
    mockedUseCase.mockReturnValue({
      data: stubCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttempt,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    expect(screen.getByRole('img', { name: /case 42/i })).toBeInTheDocument();
    expect(screen.getByTestId('answer-reveal-sweep')).toHaveAttribute(
      'data-sweeping',
      'true',
    );
  });

  it('skips the sweep and shows the verdict immediately under prefers-reduced-motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    mockedUseCase.mockReturnValue({
      data: stubCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttempt,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    expect(screen.queryByTestId('answer-reveal-sweep')).toBeNull();
    // Verdict block is present immediately (lesion image renders + at least one
    // "Correct" verdict label exists).
    expect(screen.getByRole('img', { name: /case 42/i })).toBeInTheDocument();
    expect(screen.getAllByText(/correct/i).length).toBeGreaterThan(0);
  });
});
