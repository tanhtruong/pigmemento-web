import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { SoftCircleReveal } from './soft-circle-reveal';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

describe('SoftCircleReveal', () => {
  describe('ring-fill configuration', () => {
    it('exposes the percentage on a progressbar role', () => {
      render(<SoftCircleReveal configuration="ring-fill" percentage={75} />);

      const ring = screen.getByRole('progressbar');
      expect(ring).toHaveAttribute('aria-valuenow', '75');
      expect(ring).toHaveAttribute('aria-valuemin', '0');
      expect(ring).toHaveAttribute('aria-valuemax', '100');
    });

    it.each([32, 120, 800])('renders at the requested size of %ipx', (size) => {
      render(
        <SoftCircleReveal
          configuration="ring-fill"
          percentage={50}
          size={size}
        />,
      );

      const ring = screen.getByRole('progressbar');
      expect(ring).toHaveStyle({ width: `${size}px`, height: `${size}px` });
    });
  });

  describe('silent configuration', () => {
    it('renders the lesion image with its alt text and a mask overlay above it', () => {
      render(
        <SoftCircleReveal
          configuration="silent"
          imageSrc="/lesion-1.png"
          imageAlt="Pigmented lesion on left forearm"
        />,
      );

      const image = screen.getByRole('img', {
        name: 'Pigmented lesion on left forearm',
      });
      expect(image).toHaveAttribute('src', '/lesion-1.png');

      const mask = screen.getByTestId('soft-circle-mask');
      expect(mask).toBeInTheDocument();
    });

    it('exposes the mask as a slider and moves it with arrow keys when interactive', async () => {
      const user = userEvent.setup();
      render(
        <SoftCircleReveal
          configuration="silent"
          imageSrc="/lesion-1.png"
          imageAlt="Lesion"
          interactive
        />,
      );

      const mask = screen.getByRole('slider', { name: /reveal position/i });
      expect(mask).toHaveAttribute('aria-valuenow', '50');
      expect(mask).toHaveAttribute('aria-valuemin', '0');
      expect(mask).toHaveAttribute('aria-valuemax', '100');

      mask.focus();
      await user.keyboard('{ArrowRight}');
      expect(mask).toHaveAttribute('aria-valuenow', '55');

      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(mask).toHaveAttribute('aria-valuenow', '45');
    });

    it('strips interactivity and renders a static mask under prefers-reduced-motion', async () => {
      mockedUseReducedMotion.mockReturnValue(true);
      const user = userEvent.setup();

      render(
        <SoftCircleReveal
          configuration="silent"
          imageSrc="/lesion-1.png"
          imageAlt="Lesion"
          interactive
        />,
      );

      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      const mask = screen.getByTestId('soft-circle-mask');
      expect(mask).toHaveAttribute('aria-hidden', 'true');

      await user.tab();
      await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });
  });

  describe('annotated configuration', () => {
    it('renders one feature marker per ABCDE feature with the letter and reasoning', () => {
      render(
        <SoftCircleReveal
          configuration="annotated"
          imageSrc="/lesion-1.png"
          imageAlt="Lesion"
          features={[
            {
              letter: 'A',
              centerPoint: [0.3, 0.4],
              reasoning: 'Asymmetry across the long axis',
            },
            {
              letter: 'B',
              centerPoint: [0.6, 0.55],
              reasoning: 'Irregular border on the medial edge',
            },
          ]}
        />,
      );

      const markerA = screen.getByLabelText(
        /A.*Asymmetry across the long axis/i,
      );
      expect(markerA).toHaveTextContent('A');

      const markerB = screen.getByLabelText(
        /B.*Irregular border on the medial edge/i,
      );
      expect(markerB).toHaveTextContent('B');
    });
  });
});
