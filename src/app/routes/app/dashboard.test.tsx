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
  window.localStorage.clear();
});

const todayIso = () => new Date().toISOString();

const daysAgoIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const stubCasesWithConsecutiveDays = (days: number) =>
  Array.from({ length: days }, (_, i) => ({
    id: `case-day-${i}`,
    imageUrl: `/lesion-${i}.png`,
    difficulty: 'medium' as const,
    patientAge: 30 + i,
    site: 'arm',
    lastAttempt: {
      correct: true,
      chosenLabel: 'benign' as const,
      createdAt: daysAgoIso(i),
      totalAttempts: 1,
      timeToAnswerMs: 2000,
    },
  }));

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

  it('renders the streak milestone badge when streak crosses the first threshold', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubCasesWithConsecutiveDays(3),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(screen.getByText(/week 1/i)).toBeInTheDocument();
  });

  it('marks the streak card data-celebrating="true" on an actual threshold crossing', () => {
    window.localStorage.setItem('pigmemento.streakMilestone.lastSeen', '2');
    mockedUseCaseHistory.mockReturnValue({
      data: stubCasesWithConsecutiveDays(3),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    const card = document.querySelector('[data-streak-card]');
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute('data-celebrating', 'true');
  });

  it('does not celebrate on revisit when streak has not crossed', () => {
    window.localStorage.setItem('pigmemento.streakMilestone.lastSeen', '3');
    mockedUseCaseHistory.mockReturnValue({
      data: stubCasesWithConsecutiveDays(3),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    const card = document.querySelector('[data-streak-card]');
    expect(card).not.toBeNull();
    expect(card).not.toHaveAttribute('data-celebrating', 'true');
  });

  it('silently backfills on first-ever mount (empty localStorage, streak >= threshold, no celebration)', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubCasesWithConsecutiveDays(10),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    const card = document.querySelector('[data-streak-card]');
    expect(card).not.toBeNull();
    expect(card).not.toHaveAttribute('data-celebrating', 'true');
    // But the badge is still shown — milestone exists, just no celebration.
    expect(screen.getByText(/first week/i)).toBeInTheDocument();
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
