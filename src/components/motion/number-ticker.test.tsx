import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { NumberTicker } from './number-ticker';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

describe('NumberTicker', () => {
  it('exposes the target value via aria-label so screen readers never hear a mid-animation number', () => {
    render(<NumberTicker value={84} />);
    expect(screen.getByLabelText('84')).toBeInTheDocument();
  });

  it('renders the final value as text immediately under prefers-reduced-motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    render(<NumberTicker value={84} />);
    expect(screen.getByLabelText('84')).toHaveTextContent('84');
  });

  it('applies formatValue to both the aria-label and the rendered text', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    render(<NumberTicker value={84} formatValue={(n) => `${n}%`} />);

    const ticker = screen.getByLabelText('84%');
    expect(ticker).toHaveTextContent('84%');
  });

  it('starts the visible count at the formatted zero state under normal motion', () => {
    render(<NumberTicker value={84} formatValue={(n) => `${n}%`} />);
    const ticker = screen.getByLabelText('84%');
    expect(ticker).toHaveTextContent('0%');
  });
});
