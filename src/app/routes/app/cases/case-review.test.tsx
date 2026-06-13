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
// Stand in for the flight so the integration assertion doesn't depend on
// motion's animation timing (#62).
vi.mock('@/components/motion/lesion-flight', () => ({
  LesionFlight: ({ origin }: { origin: { src: string } }) => (
    <div data-testid="lesion-flight" data-src={origin.src} />
  ),
}));

import { useReducedMotion } from 'motion/react';
import { useCase } from '@/features/cases/api/use-case.ts';
import { useCaseLatestAttempt } from '@/features/cases/api/use-case-latest-attempt.ts';
import { captureLesionFlight, consumeLesionFlight } from '@/lib/lesion-flight';

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
  clinicalNote: 'A 42-year-old patient with a pigmented lesion on the arm.',
};

const stubAnnotatedCase = {
  ...stubCase,
  abcdeFeatures: [
    {
      letter: 'A' as const,
      centerPoint: [0.3, 0.4] as [number, number],
      reasoning: 'Asymmetric across the long axis',
    },
    {
      letter: 'B' as const,
      centerPoint: [0.6, 0.55] as [number, number],
      reasoning: 'Irregular border on the medial edge',
    },
  ],
};

const stubAttemptCorrect = {
  correct: true,
  correctLabel: 'benign' as const,
  chosenLabel: 'benign' as const,
  timeToAnswerMs: 12_400,
  teachingPoints: [],
  disclaimer: '',
};

const stubAttemptIncorrect = {
  correct: false,
  correctLabel: 'malignant' as const,
  chosenLabel: 'benign' as const,
  timeToAnswerMs: 8_100,
  teachingPoints: [
    'Look at how the color shifts left-to-right — that asymmetry is one of the strongest signals here.',
  ],
  disclaimer: '',
};

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  mockedUseCase.mockReset();
  mockedUseLatestAttempt.mockReset();
  consumeLesionFlight('__drain__'); // clear any captured origin between tests
});

const mockReady = (caseData: unknown = stubCase) => {
  mockedUseCase.mockReturnValue({
    data: caseData,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useCase>);
  mockedUseLatestAttempt.mockReturnValue({
    data: stubAttemptCorrect,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useCaseLatestAttempt>);
};

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
  it('renders the diagnosis reveal with the correct outcome', () => {
    mockedUseCase.mockReturnValue({
      data: stubCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttemptCorrect,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    // The DiagnosisReveal moment is present (with aria-label on the headline).
    const reveal = screen.getByLabelText(/Benign/i, { selector: 'h2' });
    expect(reveal).toBeInTheDocument();

    // Correctness sentence — locked microcopy.
    expect(screen.getByText(/You were right\./i)).toBeInTheDocument();

    // The image still renders with the case alt.
    expect(screen.getByRole('img', { name: /case 42/i })).toBeInTheDocument();
  });

  it('renders the incorrect outcome with the locked "You said X. The answer is Y." copy', () => {
    mockedUseCase.mockReturnValue({
      data: stubCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttemptIncorrect,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    expect(
      screen.getByText(/You said Benign\. The answer is Malignant\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/asymmetry is one of the strongest signals here/i),
    ).toBeInTheDocument();
  });

  it('renders the ABCDE features in the margin-side label list when present', () => {
    mockedUseCase.mockReturnValue({
      data: stubAnnotatedCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttemptCorrect,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    expect(
      screen.getByText(/Asymmetric across the long axis/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Irregular border on the medial edge/i),
    ).toBeInTheDocument();
  });

  it('omits the ABCDE label list when the case has no annotations', () => {
    mockedUseCase.mockReturnValue({
      data: stubCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttemptCorrect,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    expect(screen.queryByText(/Asymmetric across the long axis/i)).toBeNull();
  });

  it('respects prefers-reduced-motion by rendering the composed reveal state', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    mockedUseCase.mockReturnValue({
      data: stubCase,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCase>);
    mockedUseLatestAttempt.mockReturnValue({
      data: stubAttemptCorrect,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCaseLatestAttempt>);

    renderRoute();

    // The diagnosis is still present — under reduced motion all beats just
    // render in their composed state without animation.
    expect(
      screen.getByLabelText(/Benign/i, { selector: 'h2' }),
    ).toBeInTheDocument();
  });
});

describe('CaseReviewScene lesion-flight (#62)', () => {
  it('flies the print into the review hero when an origin was captured', () => {
    captureLesionFlight(document.createElement('div'), '42', '/lesion-42.png');
    mockReady();

    renderRoute();

    const flight = screen.getByTestId('lesion-flight');
    expect(flight).toHaveAttribute('data-src', '/lesion-42.png');
  });

  it('renders the hero plain when there is no flight origin', () => {
    mockReady();

    renderRoute();

    expect(screen.queryByTestId('lesion-flight')).toBeNull();
    expect(screen.getByRole('img', { name: /case 42/i })).toBeInTheDocument();
  });

  it('does not fly under prefers-reduced-motion, even with a captured origin', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    captureLesionFlight(document.createElement('div'), '42', '/lesion-42.png');
    mockReady();

    renderRoute();

    expect(screen.queryByTestId('lesion-flight')).toBeNull();
  });
});
