import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { AnswerRevealSweep } from './answer-reveal-sweep';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

describe('AnswerRevealSweep', () => {
  it('renders a sweeping mark under normal motion', () => {
    render(<AnswerRevealSweep />);
    expect(screen.getByTestId('answer-reveal-sweep')).toHaveAttribute(
      'data-sweeping',
      'true',
    );
  });

  it('renders nothing under prefers-reduced-motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    render(<AnswerRevealSweep />);
    expect(screen.queryByTestId('answer-reveal-sweep')).toBeNull();
  });
});
