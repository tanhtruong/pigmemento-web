import { act, render, screen, waitFor } from '@testing-library/react';
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

    // The exiting wrapper is retained until its (instant) exit completes —
    // assert on the post-swap wrapper.
    await waitFor(() => {
      const wrapper = screen
        .getByText('Review content')
        .closest('[data-motion-wrapper]');
      expect(wrapper).toHaveAttribute('data-animates', 'false');
      expect(wrapper).toHaveAttribute('data-variant', 'none');
    });
  });

  it('marks the wrapper data-animates="true" on normal navigation', async () => {
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/profile');
    });

    await waitFor(() => {
      const wrapper = screen
        .getByText('Profile content')
        .closest('[data-motion-wrapper]');
      expect(wrapper).toHaveAttribute('data-animates', 'true');
    });
  });

  it('conjugates the wrapper with the grammar variant of the hop', async () => {
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/profile');
    });

    await waitFor(() => {
      const wrapper = screen
        .getByText('Profile content')
        .closest('[data-motion-wrapper]');
      expect(wrapper).toHaveAttribute('data-variant', 'lateral-forward');
    });
  });

  it('resets scroll to top under the exit on an animated hop', async () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/profile');
    });

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
    scrollSpy.mockRestore();
  });
});
