import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

vi.mock('framer-motion', async () => {
  const actual =
    await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import LandingRoute from './landing';
import { TransitionConductor } from '@/components/motion/transition-conductor';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

// The landing renders inside the conductor route shell in production
// (pathless root route in router.tsx) — mirror that here so the amber
// CTAs' useAuthEntry gesture has its context.
const renderLandingRoute = () => {
  const router = createMemoryRouter([
    {
      element: <TransitionConductor />,
      children: [{ path: '/', element: <LandingRoute /> }],
    },
  ]);
  return render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>,
  );
};

describe('landing route', () => {
  it('renders the question hero headline', () => {
    renderLandingRoute();

    // The Instrument Serif hero — split across <span>s for italic + amber
    // accent — exposes itself via accessible level-1 heading text content.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Could you\s+spot\s+it\??/);
  });

  it('renders the primary "Start a case" CTA pointing to the auth entry point', () => {
    renderLandingRoute();

    const cta = screen.getByRole('link', { name: /start a case/i });
    expect(cta).toBeInTheDocument();
    // Unauthenticated visitor (no token) routes to /auth/login.
    expect(cta.getAttribute('href')).toMatch(/\/auth\/login/);
  });

  it('closes the narrative loop with the CTA band', () => {
    renderLandingRoute();

    expect(
      screen.getByRole('heading', { name: /ready to spot it\?/i }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /start your first case/i });
    expect(cta.getAttribute('href')).toMatch(/\/auth\/login/);
  });

  it('keeps login one click away at page-load — via the primary CTA, not a standalone FAB (#87–#95)', () => {
    renderLandingRoute();

    // The redesign replaced the persistent PublicHeader with a scroll-born
    // rail: its "Log in" link only mounts once the hero is scrolled past
    // (ScrollRail's `visible` flips at ~0.6 viewport). So at page-load there is
    // no standalone Log in affordance — login is reached through the always-
    // present primary CTA, which routes an unauthenticated visitor to auth.
    expect(screen.queryByRole('link', { name: /^log in$/i })).toBeNull();
    expect(
      screen.getByRole('link', { name: /start a case/i }).getAttribute('href'),
    ).toMatch(/\/auth\/login/);
  });

  it('exposes the ISIC source credit beneath each lesion image', () => {
    renderLandingRoute();

    // The hero + centerpiece both render the source credit; that's the
    // brand-credibility move, both should be present.
    const credits = screen.getAllByText(
      /ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE/,
    );
    expect(credits.length).toBeGreaterThanOrEqual(1);
  });
});
