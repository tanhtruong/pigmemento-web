import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { RouteTransitionOutlet } from './route-transition-outlet';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

const buildRouter = (initialPath: string) =>
  createMemoryRouter(
    [
      {
        path: '/app',
        element: <RouteTransitionOutlet />,
        children: [
          { path: 'dashboard', element: <div>Dashboard content</div> },
          { path: 'profile', element: <div>Profile content</div> },
          {
            path: 'cases/:id/attempt',
            element: <div>Attempt content</div>,
          },
          {
            path: 'cases/:id/review',
            element: <div>Review content</div>,
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

const renderWithRoute = (initialPath: string) => {
  const router = buildRouter(initialPath);
  const utils = render(<RouterProvider router={router} />);
  return { ...utils, router };
};

describe('RouteTransitionOutlet', () => {
  it('renders the matched child route content', () => {
    renderWithRoute('/app/dashboard');
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('wraps content with a motion wrapper when reduced motion is off', () => {
    mockedUseReducedMotion.mockReturnValue(false);
    renderWithRoute('/app/dashboard');

    const dashboard = screen.getByText('Dashboard content');
    expect(dashboard.closest('[data-motion-wrapper]')).not.toBeNull();
  });

  it('renders content without a motion wrapper under prefers-reduced-motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    renderWithRoute('/app/dashboard');

    const dashboard = screen.getByText('Dashboard content');
    expect(dashboard.closest('[data-motion-wrapper]')).toBeNull();
  });

  it('marks the wrapper data-animates="false" on the case-attempt to case-review hop', async () => {
    const { router } = renderWithRoute('/app/cases/42/attempt');
    expect(screen.getByText('Attempt content')).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/app/cases/42/review');
    });

    const review = screen.getByText('Review content');
    const wrapper = review.closest('[data-motion-wrapper]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-animates', 'false');
  });

  it('marks the wrapper data-animates="true" on normal navigation', async () => {
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/profile');
    });

    const profile = screen.getByText('Profile content');
    const wrapper = profile.closest('[data-motion-wrapper]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-animates', 'true');
  });
});
