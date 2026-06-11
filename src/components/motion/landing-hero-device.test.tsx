import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { LandingHeroDevice } from './landing-hero-device';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

describe('LandingHeroDevice', () => {
  it('renders the showcase image with alt text and a drag-to-scrub slider mask', () => {
    render(
      <LandingHeroDevice
        imageSrc="/showcase.png"
        imageAlt="Placeholder showcase lesion"
      />,
    );

    const image = screen.getByRole('img', {
      name: 'Placeholder showcase lesion',
    });
    expect(image).toHaveAttribute('src', '/showcase.png');

    const mask = screen.getByRole('slider', { name: /reveal position/i });
    expect(mask).toBeInTheDocument();
  });

  it('strips the slider under prefers-reduced-motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);

    render(
      <LandingHeroDevice
        imageSrc="/showcase.png"
        imageAlt="Placeholder showcase lesion"
      />,
    );

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Placeholder showcase lesion' }),
    ).toBeInTheDocument();
  });
});
