import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/app/cases',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    }),
  };
});
vi.mock('motion/react', () => ({ useReducedMotion: vi.fn(() => false) }));
vi.mock('@/lib/view-transitions', () => ({
  supportsViewTransitions: vi.fn(() => true),
}));

import { useReducedMotion } from 'motion/react';
import { supportsViewTransitions } from '@/lib/view-transitions';
import { useInAppNavigate } from './use-in-app-navigate';

const Harness = ({ to }: { to: string }) => {
  const navigate = useInAppNavigate();
  return <button onClick={() => navigate(to)}>go</button>;
};

const go = (to: string) => {
  render(<Harness to={to} />);
  fireEvent.click(screen.getByText('go'));
};

beforeEach(() => {
  mockNavigate.mockClear();
  vi.mocked(useReducedMotion).mockReturnValue(false);
  vi.mocked(supportsViewTransitions).mockReturnValue(true);
});

describe('useInAppNavigate (#105)', () => {
  it('navigates a supported hop with a View Transition, like a tab click', () => {
    go('/app/dashboard'); // from /app/cases → lateral-forward
    expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard', {
      viewTransition: true,
    });
  });

  it('cuts instantly under reduced motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    go('/app/dashboard');
    expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard', {
      viewTransition: false,
    });
  });

  it('cuts instantly when the browser lacks View Transitions', () => {
    vi.mocked(supportsViewTransitions).mockReturnValue(false);
    go('/app/profile');
    expect(mockNavigate).toHaveBeenCalledWith('/app/profile', {
      viewTransition: false,
    });
  });
});
