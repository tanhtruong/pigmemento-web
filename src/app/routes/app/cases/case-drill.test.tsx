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

import { useRandomCase } from '@/features/cases/api/use-case-random.ts';
import { useCaseSubmitAttempt } from '@/features/cases/api/use-case-submit-attempt.ts';
import CaseDrillScene from './case-drill';

const mockedUseRandomCase = vi.mocked(useRandomCase);
const mockedUseSubmit = vi.mocked(useCaseSubmitAttempt);

const caseStub = {
  id: '42',
  imageUrl: '/lesion-42.png',
  site: 'back',
  patientAge: 50,
  clinicalNote: 'A pigmented lesion.',
};

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
