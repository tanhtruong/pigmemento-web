import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { captureLesionFlight, consumeLesionFlight } from '@/lib/lesion-flight';

import { CaseAttemptView } from './case-attempt';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

const stubCase = {
  id: '42',
  imageUrl: '/lesion-42.png',
  site: 'arm',
  patientAge: 42,
  clinicalNote: 'A pigmented lesion on the arm.',
};

const recordOriginFor = (caseId: string) => {
  const card = document.createElement('a');
  const thumb = document.createElement('div');
  thumb.setAttribute('data-case-thumb', '');
  card.appendChild(thumb);
  document.body.appendChild(card);
  captureLesionFlight(card, caseId, '/lesion-42.png');
};

const renderView = () =>
  render(
    <CaseAttemptView
      caseItem={stubCase}
      committed={null}
      isPending={false}
      onCommit={() => {}}
    />,
  );

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
  consumeLesionFlight('__drain__');
  document.body.innerHTML = '';
});

describe('CaseAttemptView lesion flight (#55)', () => {
  it('flies the print from a recorded origin and lands it in the hero', async () => {
    recordOriginFor('42');
    renderView();

    // In flight: the portal print exists and the hero stays hidden under it.
    expect(document.querySelector('[data-lesion-flight]')).not.toBeNull();
    expect(document.querySelector('[data-flight-target]')).toHaveAttribute(
      'data-flight-hidden',
      'true',
    );

    // Landing: overlay gone and hero revealed in the same commit.
    await waitFor(
      () => {
        expect(document.querySelector('[data-lesion-flight]')).toBeNull();
        expect(document.querySelector('[data-flight-target]')).toHaveAttribute(
          'data-flight-hidden',
          'false',
        );
      },
      { timeout: 3000 },
    );
    expect(screen.getByAltText('Case 42')).toBeInTheDocument();
  });

  it('renders plain when no origin was recorded — deep links and refreshes never fly', () => {
    renderView();

    expect(document.querySelector('[data-lesion-flight]')).toBeNull();
    expect(document.querySelector('[data-flight-target]')).toHaveAttribute(
      'data-flight-hidden',
      'false',
    );
  });

  it('cuts straight to the hero under reduced motion, consuming the origin', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    recordOriginFor('42');
    renderView();

    expect(document.querySelector('[data-lesion-flight]')).toBeNull();
    expect(document.querySelector('[data-flight-target]')).toHaveAttribute(
      'data-flight-hidden',
      'false',
    );
    // The skipped origin must not leak into a later mount.
    expect(consumeLesionFlight('42')).toBeNull();
  });
});

describe('CaseAttemptView verdict in place (#85)', () => {
  const renderWithVerdict = (resolved: boolean) =>
    render(
      <CaseAttemptView
        caseItem={stubCase}
        committed={resolved ? 'benign' : null}
        isPending={false}
        onCommit={() => {}}
        resolved={resolved}
        title={resolved ? 'Review' : undefined}
        heroSourceCredit={resolved ? 'CASE 42 · MALIGNANT' : undefined}
        verdictNode={<p>verdict in place</p>}
      />,
    );

  it('shows the choices, not the verdict, before the answer resolves', () => {
    renderWithVerdict(false);

    expect(screen.getByRole('button', { name: /benign/i })).toBeInTheDocument();
    expect(screen.queryByText('verdict in place')).not.toBeInTheDocument();
  });

  it('swaps the working column to the verdict once resolved', () => {
    renderWithVerdict(true);

    expect(screen.getByText('verdict in place')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });
});
