import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

vi.mock('@/lib/lazy-gsap', () => ({
  loadGsap: vi.fn(() => new Promise(() => {})),
}));

import { useReducedMotion } from 'motion/react';
import { loadGsap } from '@/lib/lazy-gsap';

import { HowItWorksSection } from './how-it-works-section';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);
const mockedLoadGsap = vi.mocked(loadGsap);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  mockedLoadGsap.mockReset();
  mockedLoadGsap.mockImplementation(() => new Promise(() => {}));
});

describe('HowItWorksSection', () => {
  it('renders the five stage titles', () => {
    render(<HowItWorksSection />);

    expect(screen.getAllByText(/pick a track/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/review the case/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/decide.*justify/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/get feedback/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/track progress/i).length).toBeGreaterThan(0);
  });

  it('renders a plain vertical stack under prefers-reduced-motion (no pinned container)', () => {
    mockedUseReducedMotion.mockReturnValue(true);

    render(<HowItWorksSection />);

    // All five stages are simultaneously visible in the document tree.
    expect(screen.getByText(/pick a track/i)).toBeVisible();
    expect(screen.getByText(/track progress/i)).toBeVisible();

    // The pinned container marker is absent in reduced-motion mode.
    expect(document.querySelector('[data-how-pinned]')).toBeNull();
  });

  it('does not load GSAP under prefers-reduced-motion', async () => {
    mockedUseReducedMotion.mockReturnValue(true);
    render(<HowItWorksSection />);
    await Promise.resolve();
    expect(mockedLoadGsap).not.toHaveBeenCalled();
  });

  it('lazy-loads GSAP on mount under normal motion', async () => {
    render(<HowItWorksSection />);
    await Promise.resolve();
    expect(mockedLoadGsap).toHaveBeenCalledTimes(1);
  });
});
