import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => true) };
});

vi.mock('@/features/cases/api/use-case-history.ts', () => ({
  useCaseHistory: vi.fn(),
}));

import { useReducedMotion } from 'motion/react';
import { useCaseHistory } from '@/features/cases/api/use-case-history.ts';
import Dashboard from './dashboard';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);
const mockedUseCaseHistory = vi.mocked(useCaseHistory);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(true);
  mockedUseCaseHistory.mockReset();
});

const todayIso = () => new Date().toISOString();

const stubCases = () => [
  {
    id: 'c1',
    imageUrl: '/a.png',
    difficulty: 'medium' as const,
    patientAge: 42,
    site: 'arm',
    lastAttempt: {
      correct: true,
      chosenLabel: 'benign' as const,
      createdAt: todayIso(),
      totalAttempts: 1,
      timeToAnswerMs: 2000,
    },
  },
  {
    id: 'c2',
    imageUrl: '/b.png',
    difficulty: 'easy' as const,
    patientAge: 30,
    site: 'leg',
    lastAttempt: {
      correct: false,
      chosenLabel: 'benign' as const,
      createdAt: todayIso(),
      totalAttempts: 1,
      timeToAnswerMs: 2000,
    },
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe('Dashboard', () => {
  it('exposes accuracy, attempts, avg time, and streak via NumberTicker aria-labels', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubCases(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(screen.getByLabelText('50%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('2', { selector: 'span' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('2s')).toBeInTheDocument();
    expect(
      screen.getByLabelText('1', { selector: 'span' }),
    ).toBeInTheDocument();
  });

  it('renders a ring-fill SoftCircleReveal next to the accuracy number', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubCases(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveAttribute('aria-valuenow', '50');
  });
});
