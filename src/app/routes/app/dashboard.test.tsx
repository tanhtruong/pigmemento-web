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

vi.mock('@/features/profile/api/use-profile.ts', () => ({
  useProfile: vi.fn(() => ({ data: undefined })),
}));

import { useReducedMotion } from 'motion/react';
import { useCaseHistory } from '@/features/cases/api/use-case-history.ts';
import { useProfile } from '@/features/profile/api/use-profile.ts';
import Dashboard from './dashboard';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);
const mockedUseCaseHistory = vi.mocked(useCaseHistory);
const mockedUseProfile = vi.mocked(useProfile);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(true);
  mockedUseCaseHistory.mockReset();
  mockedUseProfile.mockReset();
  mockedUseProfile.mockReturnValue({ data: undefined } as ReturnType<
    typeof useProfile
  >);
  window.localStorage.clear();
});

const todayIso = () => new Date().toISOString();

const daysAgoIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const stubAttempts = () => [
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
  {
    id: 'c3',
    imageUrl: '/c.png',
    difficulty: 'medium' as const,
    patientAge: 50,
    site: 'leg',
    lastAttempt: {
      correct: false,
      chosenLabel: 'benign' as const,
      createdAt: daysAgoIso(1),
      totalAttempts: 1,
      timeToAnswerMs: 2500,
    },
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe('Dashboard (Progress)', () => {
  it('renders the editorial greeting eyebrow + Instrument Serif headline', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubAttempts(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /Good to see you/i }),
    ).toBeInTheDocument();
  });

  it('greets by the real first name from the profile', () => {
    mockedUseCaseHistory.mockReturnValue({ data: [] } as ReturnType<
      typeof useCaseHistory
    >);
    mockedUseProfile.mockReturnValue({
      data: { name: 'Anh Tuan', email: 'att@carelink.dk' },
    } as ReturnType<typeof useProfile>);

    renderDashboard();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Good to see you, Anh\./i,
      }),
    ).toBeInTheDocument();
  });

  it('falls back to a plain greeting — never the email handle — when no name is set', () => {
    mockedUseCaseHistory.mockReturnValue({ data: [] } as ReturnType<
      typeof useCaseHistory
    >);
    mockedUseProfile.mockReturnValue({
      data: { name: '', email: 'att@carelink.dk' },
    } as ReturnType<typeof useProfile>);

    renderDashboard();

    const heading = screen.getByRole('heading', {
      level: 1,
      name: /Good to see you/i,
    });
    expect(heading).toHaveTextContent('Good to see you.');
    expect(heading).not.toHaveTextContent(/att/i);
  });

  it('surfaces the hero metric (today count) with weekly and monthly context', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubAttempts(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    // The hero metric block's secondary line is "{week} this week · {month} this month".
    expect(screen.getByText(/this month/i)).toBeInTheDocument();
  });

  it('renders the "Where you stumble" pattern panel when at least one site has 2+ attempts', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubAttempts(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(screen.getByText(/Where you stumble/i)).toBeInTheDocument();
    // "leg" has 2 attempts (c2 + c3), 0 correct → it should surface as the stumble.
    expect(screen.getByText(/Leg cases — 0%/i)).toBeInTheDocument();
  });

  it('renders the recent attempts journal with rows linked to review', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubAttempts(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(screen.getByText(/Recent attempts/i)).toBeInTheDocument();
    expect(screen.getByText(/CASE · c1/i)).toBeInTheDocument();
    expect(screen.getByText(/CASE · c2/i)).toBeInTheDocument();
  });

  it('renders the rolling-year calendar heatmap', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubAttempts(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(
      screen.getByRole('grid', { name: /activity over the last 53 weeks/i }),
    ).toBeInTheDocument();
  });

  it('renders the footer with total cases', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: stubAttempts(),
    } as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(screen.getByText(/total cases: 3/i)).toBeInTheDocument();
  });

  it('shows an empty state when the user has no attempts yet', () => {
    mockedUseCaseHistory.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useCaseHistory>);

    renderDashboard();

    expect(
      screen.getByText(/No attempts yet\. Start your first case/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Start a case/i }),
    ).toBeInTheDocument();
  });
});
