import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  // Render the case directly (no AnimatePresence advance) for a structural test.
  return { ...actual, useReducedMotion: vi.fn(() => true) };
});
vi.mock('@/features/cases/api/use-case-random.ts', () => ({
  useRandomCase: vi.fn(),
}));
vi.mock('@/features/cases/api/use-case-submit-attempt.ts', () => ({
  useCaseSubmitAttempt: vi.fn(),
}));
vi.mock('@/features/cases/api/use-case-latest-attempt.ts', () => ({
  useCaseLatestAttempt: vi.fn(),
}));

import { useRandomCase } from '@/features/cases/api/use-case-random.ts';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import CaseDrillScene from './case-drill';

const mockedUseRandomCase = vi.mocked(useRandomCase);
const mockedUseSubmit = vi.mocked(useCaseSubmitAttempt);
const mockedUseLatestAttempt = vi.mocked(useCaseLatestAttempt);

const caseStub = {
  id: '42',
  imageUrl: '/lesion-42.png',
  site: 'back',
  patientAge: 50,
  clinicalNote: 'A pigmented lesion.',
};

// A graded verdict reaches the rewired drill through the latest-attempt query
// (the engine seeds it from the submit). Mocked so the rewired drill resolves;
// inert for the pre-rewire drill, which reads the answer off the submit response.
const setLatestAttempt = (data: unknown) =>
  mockedUseLatestAttempt.mockReturnValue({
    data,
  } as unknown as ReturnType<typeof useCaseLatestAttempt>);

afterEach(() => {
  vi.clearAllMocks();
});

const renderDrill = () => {
  mockedUseRandomCase.mockReturnValue({
    data: caseStub,
    isLoading: false,
    isError: false,
    refetch: vi.fn().mockResolvedValue({}),
  } as unknown as ReturnType<typeof useRandomCase>);
  mockedUseSubmit.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as unknown as ReturnType<typeof useCaseSubmitAttempt>);
  setLatestAttempt(undefined);

  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/cases/drill']}>
        <CaseDrillScene />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('CaseDrillScene parity (#61)', () => {
  it('runs each drill case through the shared CaseAttemptView', async () => {
    renderDrill();

    // Setup phase first.
    const start = screen.getByRole('button', { name: /start drill/i });
    await act(async () => {
      start.click();
    });

    // The shared attempt surface — not the old bespoke "Image"/"Your answer".
    await waitFor(() => {
      expect(screen.getByText('What do you see?')).toBeInTheDocument();
    });
    expect(screen.getByText('Benign')).toBeInTheDocument();
    expect(screen.getByText('Malignant')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.queryByText('Your answer')).not.toBeInTheDocument();
  });

  it('labels the eyebrow with drill progress', async () => {
    renderDrill();
    await act(async () => {
      screen.getByRole('button', { name: /start drill/i }).click();
    });
    await waitFor(() => {
      expect(screen.getByText(/Drill · 1 \/ 5/)).toBeInTheDocument();
    });
  });
});

// Characterization of the running-phase lifecycle (#122) — locks the
// commit → reveal → advance and skip → advance behaviour before the drill is
// rewired onto useAttempt, so the refactor can't silently change it.
describe('CaseDrillScene lifecycle (#122)', () => {
  const renderRunning = (
    mutate: ReturnType<typeof vi.fn>,
    latestAttempt?: unknown,
  ) => {
    mockedUseRandomCase.mockReturnValue({
      data: caseStub,
      isLoading: false,
      isError: false,
      refetch: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof useRandomCase>);
    mockedUseSubmit.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useCaseSubmitAttempt>);
    setLatestAttempt(latestAttempt);

    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/app/cases/drill']}>
          <CaseDrillScene />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const startDrill = async () => {
    await act(async () => {
      screen.getByRole('button', { name: /start drill/i }).click();
    });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /benign/i }),
      ).toBeInTheDocument(),
    );
  };

  it('reveals correctness on a graded commit, then advances after the hold', async () => {
    const mutate = vi.fn(
      (_vars: unknown, opts?: { onSuccess?: (res: unknown) => void }) =>
        opts?.onSuccess?.({
          correct: false,
          correctLabel: 'malignant',
          teachingPoints: [],
          disclaimer: '',
        }),
    );
    renderRunning(mutate, {
      correct: false,
      correctLabel: 'malignant',
      teachingPoints: [],
      disclaimer: '',
      chosenLabel: 'benign',
      timeToAnswerMs: 1000,
    });
    await startDrill();

    await act(async () => {
      screen.getByRole('button', { name: /benign/i }).click();
    });

    expect(mutate).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        screen.getByText(/Incorrect — answer: Malignant/i),
      ).toBeInTheDocument(),
    );

    await waitFor(
      () => expect(screen.getByText(/Drill · 2 \/ 5/)).toBeInTheDocument(),
      { timeout: 1500 },
    );
  });

  it('skips without submitting and advances', async () => {
    const mutate = vi.fn();
    renderRunning(mutate);
    await startDrill();

    await act(async () => {
      screen.getByRole('button', { name: /skip/i }).click();
    });

    expect(mutate).not.toHaveBeenCalled();
    await waitFor(
      () => expect(screen.getByText(/Drill · 2 \/ 5/)).toBeInTheDocument(),
      { timeout: 1500 },
    );
  });
});
