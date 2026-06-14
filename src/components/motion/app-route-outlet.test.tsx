import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

// jsdom has no startViewTransition, so feature detection is stubbed to "supported"
// — this is how the outlet behaves in a View-Transition-capable browser.
vi.mock('@/lib/view-transitions', () => ({
  supportsViewTransitions: vi.fn(() => true),
}));

import { useReducedMotion } from 'motion/react';

import { AppRouteOutlet } from './app-route-outlet';
import { rememberScroll } from '@/lib/route-scroll';
import { supportsViewTransitions } from '@/lib/view-transitions';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);
const mockedSupportsVT = vi.mocked(supportsViewTransitions);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  mockedSupportsVT.mockReturnValue(true);
  delete document.documentElement.dataset.vt;
});

const buildRouter = (
  initialPath: string,
  profileLoader?: () => Promise<null>,
) =>
  createMemoryRouter(
    [
      {
        path: '/app',
        element: <AppRouteOutlet />,
        children: [
          { path: 'dashboard', element: <div>Dashboard content</div> },
          {
            path: 'profile',
            loader: profileLoader,
            element: <div>Profile content</div>,
          },
          { path: 'cases/:id/attempt', element: <div>Attempt content</div> },
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

describe('AppRouteOutlet', () => {
  it('renders the matched child route content', () => {
    renderWithRoute('/app/dashboard');
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});

describe('scroll restoration (#63)', () => {
  it('resets scroll to the top on a forward / lateral hop', async () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { router } = renderWithRoute('/app/dashboard');

    await act(async () => {
      await router.navigate('/app/profile'); // lateral-forward
    });

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
    scrollSpy.mockRestore();
  });

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
  const buildSlowRouter = (initialPath: string) => {
    let resolveLoader!: () => void;
    const loaderGate = new Promise<null>((resolve) => {
      resolveLoader = () => resolve(null);
    });
    const router = buildRouter(initialPath, () => loaderGate);
    return { router, resolveLoader };
  };

  const surface = () =>
    document.querySelector('[data-app-route-surface]') as HTMLElement | null;

  it('holds the outgoing surface in the early fix while a slow loader resolves', async () => {
    const { router } = buildSlowRouter('/app/dashboard');
    render(<RouterProvider router={router} />);

    act(() => {
      void router.navigate('/app/profile');
    });

    await waitFor(() => {
      expect(surface()).toHaveAttribute('data-pending', 'true');
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
    expect(surface()).toHaveAttribute('data-pending', 'false');

    act(() => {
      resolveLoader();
    });

    await waitFor(() => {
      expect(screen.getByText('Profile content')).toBeInTheDocument();
      expect(surface()).toHaveAttribute('data-pending', 'false');
    });
  });

  it('never dims under prefers-reduced-motion, even past the threshold', async () => {
    mockedUseReducedMotion.mockReturnValue(true);
    const { router } = buildSlowRouter('/app/dashboard');
    render(<RouterProvider router={router} />);

    act(() => {
      void router.navigate('/app/profile');
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });
    expect(surface()).toHaveAttribute('data-pending', 'false');
  });
});

describe('develop conjugation (#103)', () => {
  afterEach(() => {
    vi.spyOn(window, 'scrollTo').mockRestore();
  });

  const navigateAndRead = async (from: string, to: string) => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { router } = renderWithRoute(from);
    await act(async () => {
      await router.navigate(to);
    });
    return document.documentElement.dataset.vt;
  };

  it('arms the directional keyframes via data-vt, conjugated by the hop', async () => {
    expect(await navigateAndRead('/app/dashboard', '/app/profile')).toBe(
      'lateral-forward',
    );
  });

  it('conjugates a descend into case flow', async () => {
    expect(
      await navigateAndRead('/app/dashboard', '/app/cases/42/attempt'),
    ).toBe('descend');
  });

  it('clears data-vt on an instant cut under reduced motion', async () => {
    mockedUseReducedMotion.mockReturnValue(true);
    // A stale value from an earlier animated hop must not survive an instant cut.
    document.documentElement.dataset.vt = 'descend';

    expect(
      await navigateAndRead('/app/dashboard', '/app/profile'),
    ).toBeUndefined();
  });

  it('clears data-vt when the browser lacks View Transitions', async () => {
    mockedSupportsVT.mockReturnValue(false);
    document.documentElement.dataset.vt = 'ascend';

    expect(
      await navigateAndRead('/app/dashboard', '/app/profile'),
    ).toBeUndefined();
  });
});
