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
import { consumeLesionFlight } from '@/lib/lesion-flight';
import { rememberScroll } from '@/lib/route-scroll';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  // Drain any flight origin a test left stored so it can't leak into the next.
  consumeLesionFlight('__drain__');
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

describe('scroll restoration (#63)', () => {
  it('restores the prior scroll position when ascending back out of a case', async () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    // The dashboard was scrolled to 240 before we descended into the case.
    rememberScroll('/app/dashboard', 240);

    const { router } = renderWithRoute('/app/cases/42/attempt');
    await act(async () => {
      await router.navigate('/app/dashboard'); // ascend — restores 240
    });

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith(0, 240);
    });
    scrollSpy.mockRestore();
  });

  it('scrolls to top when descending into a case, ignoring any stale saved position', async () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    rememberScroll('/app/cases/99/attempt', 500);

    const { router } = renderWithRoute('/app/dashboard');
    await act(async () => {
      await router.navigate('/app/cases/99/attempt'); // descend
    });

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
    scrollSpy.mockRestore();
  });
});

describe('pending fix-out dim (#54)', () => {
  /**
   * Router whose destination routes block on a loader the test resolves
   * by hand — how slow react-query cache misses look to the router.
   */
  const buildSlowRouter = (initialPath: string) => {
    let resolveLoader!: () => void;
    const loaderGate = new Promise<null>((resolve) => {
      resolveLoader = () => resolve(null);
    });
    const router = createMemoryRouter(
      [
        {
          path: '/app',
          element: <RouteTransitionOutlet />,
          children: [
            { path: 'dashboard', element: <div>Dashboard content</div> },
            {
              path: 'profile',
              loader: () => loaderGate,
              element: <div>Profile content</div>,
            },
            {
              path: 'cases/:id/attempt',
              element: <div>Attempt content</div>,
            },
          ],
        },
      ],
      { initialEntries: [initialPath] },
    );
    return { router, resolveLoader };
  };

  it('holds the outgoing surface in the early fix while a slow loader resolves', async () => {
    const { router } = buildSlowRouter('/app/dashboard');
    render(<RouterProvider router={router} />);

    act(() => {
      void router.navigate('/app/profile');
    });

    // Past the hold threshold the still-mounted dashboard dims into the
    // held fix while the loader is pending.
    await waitFor(() => {
      const wrapper = screen
        .getByText('Dashboard content')
        .closest('[data-motion-wrapper]');
      expect(wrapper).toHaveAttribute('data-held', 'true');
    });
  });

  it('completes the normal Develop once the held loader resolves', async () => {
    const { router, resolveLoader } = buildSlowRouter('/app/dashboard');
    render(<RouterProvider router={router} />);

    act(() => {
      void router.navigate('/app/profile');
    });
    await waitFor(() => {
      expect(
        screen.getByText('Dashboard content').closest('[data-motion-wrapper]'),
      ).toHaveAttribute('data-held', 'true');
    });

    act(() => {
      resolveLoader();
    });

    await waitFor(() => {
      const wrapper = screen
        .getByText('Profile content')
        .closest('[data-motion-wrapper]');
      expect(wrapper).toHaveAttribute('data-variant', 'lateral-forward');
      expect(wrapper).toHaveAttribute('data-held', 'false');
    });
  });

  it('never dims a hop whose loader resolves under the hold threshold', async () => {
    const { router, resolveLoader } = buildSlowRouter('/app/dashboard');
    render(<RouterProvider router={router} />);

    act(() => {
      void router.navigate('/app/profile');
    });

    // Still pending, but under PENDING_HOLD_MS — visually unchanged.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(
      screen.getByText('Dashboard content').closest('[data-motion-wrapper]'),
    ).toHaveAttribute('data-held', 'false');

    act(() => {
      resolveLoader();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Profile content').closest('[data-motion-wrapper]'),
      ).toHaveAttribute('data-held', 'false');
    });
  });
});

describe('no develop wash (#73)', () => {
  it('dissolves a descend into case flow with no amber wash overlay', async () => {
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/cases/42/attempt');
    });

    await waitFor(() => {
      expect(
        screen.getByText('Attempt content').closest('[data-motion-wrapper]'),
      ).toHaveAttribute('data-variant', 'descend');
    });
    // #73 removed the DevelopWash — entering a case is now a plain dissolve.
    expect(document.querySelector('[data-develop-wash]')).toBeNull();
  });

  it('renders no wash on a quiet lateral tab hop either', async () => {
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/profile');
    });

    await waitFor(() => {
      expect(
        screen.getByText('Profile content').closest('[data-motion-wrapper]'),
      ).toHaveAttribute('data-variant', 'lateral-forward');
    });
    expect(document.querySelector('[data-develop-wash]')).toBeNull();
  });
});
