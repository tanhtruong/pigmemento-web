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
  it('renders the LandingHeroDevice with the placeholder showcase image', () => {
    renderLandingRoute();

    expect(
      screen.getByRole('slider', { name: /reveal position/i }),
    ).toBeInTheDocument();
  });

  it('renders the HowItWorksSection in the page', () => {
    renderLandingRoute();

    // HowItWorksSection's pinned variant marks itself with data-how-pinned —
    // the inline (now-removed) "How it works" section never carried this attr.
    expect(document.querySelector('[data-how-pinned]')).not.toBeNull();
  });

  it('exposes the percentage retain stat via a ring-fill SoftCircleReveal', () => {
    renderLandingRoute();

    // The retain-percent stat carries a progressbar with the percentage echoing
    // the dashboard's Accuracy ring (the landing/app motif echo).
    const rings = screen.getAllByRole('progressbar');
    const retainRing = rings.find(
      (r) => r.getAttribute('aria-valuenow') === '85',
    );
    expect(retainRing).toBeDefined();
  });

  it('exposes the practice-cases stat via NumberTicker aria-label', () => {
    renderLandingRoute();

    // Ticker animates 0 → 1000 with the formatter producing "1k+".
    expect(screen.getByLabelText('1k+')).toBeInTheDocument();
  });

  it('exposes the percentage retain stat via NumberTicker aria-label too', () => {
    renderLandingRoute();

    expect(screen.getByLabelText('85%')).toBeInTheDocument();
  });
});
