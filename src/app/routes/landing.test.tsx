import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
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

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

const renderLandingRoute = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <LandingRoute />
      </MemoryRouter>
    </HelmetProvider>,
  );

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

  it('renders the trust strip with the ISIC source attribution', () => {
    renderLandingRoute();

    expect(
      screen.getByRole('region', { name: /why you can trust pigmemento/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /sourced from the isic archive/i }),
    ).toHaveAttribute('href', 'https://www.isic-archive.com/');
  });

  it('keeps the existing HowItWorksSection mounted (PR2 leaves it for PR6)', () => {
    renderLandingRoute();

    expect(document.querySelector('[data-how-pinned]')).not.toBeNull();
  });

  it('exposes the ISIC source credit beneath the hero lesion', () => {
    renderLandingRoute();

    expect(
      screen.getByText(/ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE/),
    ).toBeInTheDocument();
  });
});
