import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

// Render the static floor deterministically: reduced motion collapses the
// hero's ask⇄verdict cross-fade to an instant swap and drops the whileInView
// reveals, so every section is queryable without animation timing.
vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => true) };
});

vi.mock('framer-motion', async () => {
  const actual =
    await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: vi.fn(() => true) };
});

import LandingRoute from './landing';
import { TransitionConductor } from '@/components/motion/transition-conductor';

// Mirror production: the route renders inside the conductor shell so the amber
// CTAs' useAuthEntry gesture has its context.
const renderLanding = () => {
  const router = createMemoryRouter(
    [
      {
        element: <TransitionConductor />,
        children: [{ path: '/', element: <LandingRoute /> }],
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>,
  );
};

describe('landing route', () => {
  it('renders the playable hero headline', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /Could you\s+spot\s+it\??/,
    );
  });

  it('flips the playable rep from question to verdict on answer', async () => {
    const user = userEvent.setup();
    renderLanding();

    // Question state.
    expect(screen.getByText(/your call/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /melanoma/i }));

    // Verdict state — the live region appears with the scored result and the
    // "See why" nudge into the breakdown.
    const verdict = await screen.findByRole('status');
    expect(verdict).toHaveTextContent(/correct\./i);
    expect(
      screen.getByRole('button', { name: /see why/i }),
    ).toBeInTheDocument();
  });

  it('routes the auth-aware CTA to /auth/login when signed out', () => {
    renderLanding();
    const cta = screen.getByRole('link', { name: /start your first case/i });
    expect(cta.getAttribute('href')).toMatch(/\/auth\/login/);
  });

  it('shows the static ABCDE breakdown of Case 001 with the diagnosis reveal', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: /^Melanoma$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Asymmetric across the long axis/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Evolving — gradual darkening over months/i),
    ).toBeInTheDocument();
  });

  it('lists the four Why value props', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: /^Real dermoscopic cases$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /feedback that teaches/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /abcde-aware/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /respects your time/i }),
    ).toBeInTheDocument();
  });

  it('renders the FAQ content', () => {
    renderLanding();
    expect(screen.getByText(/Who is Pigmemento for\?/i)).toBeInTheDocument();
  });

  it('closes the loop with the Case 002 CTA band', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: /ready to spot it\?/i }),
    ).toBeInTheDocument();
  });

  it('embeds FAQPage + Organization JSON-LD', () => {
    const { container } = renderLanding();
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts).toHaveLength(2);
    const payloads = Array.from(scripts).map((s) => s.textContent ?? '');
    expect(payloads.some((p) => p.includes('"FAQPage"'))).toBe(true);
    expect(payloads.some((p) => p.includes('"Organization"'))).toBe(true);
  });

  it('includes the sr-only SEO intro', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: /what is pigmemento\?/i }),
    ).toBeInTheDocument();
  });
});
