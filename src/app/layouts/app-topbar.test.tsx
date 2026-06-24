import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

// The avatar menu fetches the profile and reaches for the transition
// conductor — collaborators with their own tests. Stub it so these specs stay
// about the top bar's own composition.
vi.mock('@/app/layouts/app-avatar-menu.tsx', () => ({
  AppAvatarMenu: () => <button aria-label="Account menu">avatar</button>,
}));

import AppTopBar from './app-topbar';

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    [{ path: '/app/*', element: <AppTopBar /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
};

describe('AppTopBar — stripped-minimal chrome (#66)', () => {
  it('keeps the four primary nav surfaces as wayfinding links', () => {
    renderAt('/app/cases');
    for (const label of ['Dashboard', 'Library', 'Practice', 'Profile']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('strips the bar to a single control — the avatar (no CTA, streak, or ⌘K)', () => {
    renderAt('/app/cases');
    // Nav items are links; the only button left in the bar is the avatar.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /start a case/i })).toBeNull();
    expect(
      screen.queryByRole('button', { name: /command palette/i }),
    ).toBeNull();
  });

  it('marks the current surface with aria-current="page", quietly', () => {
    renderAt('/app/dashboard');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Library' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('treats a case-flow surface as Practice being current (prefix match)', () => {
    renderAt('/app/cases/drill');
    expect(screen.getByRole('link', { name: 'Practice' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('lights only Practice on the random-attempt route — not Library (longest-prefix wins)', () => {
    renderAt('/app/cases/random/attempt');
    expect(screen.getByRole('link', { name: 'Practice' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Library' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('treats a specific case attempt as Library being current', () => {
    renderAt('/app/cases/abc-123/attempt');
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Practice' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('names only the active tab indicator, so the View Transition morphs it (#104)', () => {
    const { container } = renderAt('/app/dashboard');
    // Exactly one `tab-indicator` exists in the bar — no duplicate-name abort.
    const named = container.querySelectorAll('[style*="view-transition-name"]');
    expect(named).toHaveLength(1);
    expect(
      screen
        .getByRole('link', { name: 'Dashboard' })
        .querySelector('[style*="view-transition-name"]'),
    ).not.toBeNull();
    expect(
      screen
        .getByRole('link', { name: 'Library' })
        .querySelector('[style*="view-transition-name"]'),
    ).toBeNull();
  });
});
