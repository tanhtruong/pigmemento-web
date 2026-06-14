import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { AnnotatedLesionImage } from './annotated-lesion-image';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

const imgs = () => document.querySelectorAll('img');

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  document.body.innerHTML = '';
});

describe('AnnotatedLesionImage hero handoff (#99)', () => {
  it('crossfades in-frame when the case changes — both lesions briefly co-exist', async () => {
    const { rerender } = render(
      <AnnotatedLesionImage src="/lesion-a.png" alt="Case A" />,
    );
    expect(imgs()).toHaveLength(1);

    rerender(<AnnotatedLesionImage src="/lesion-b.png" alt="Case B" />);

    // The outgoing lesion lingers under the incoming one — a crossfade, not a
    // hard cut.
    expect(imgs()).toHaveLength(2);

    // ...then the old lesion retires, leaving the new one in the frame.
    await waitFor(() => expect(imgs()).toHaveLength(1), { timeout: 3000 });
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      '/lesion-b.png',
    );
  });

  it('hard-cuts the lesion under reduced motion — no lingering layer', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    const { rerender } = render(
      <AnnotatedLesionImage src="/lesion-a.png" alt="Case A" />,
    );

    rerender(<AnnotatedLesionImage src="/lesion-b.png" alt="Case B" />);

    expect(imgs()).toHaveLength(1);
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      '/lesion-b.png',
    );
  });
});
