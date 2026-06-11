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

describe('landing route', () => {
  it('renders the LandingHeroDevice with the placeholder showcase image', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <LandingRoute />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(
      screen.getByRole('slider', { name: /reveal position/i }),
    ).toBeInTheDocument();
  });
});
