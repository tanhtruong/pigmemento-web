import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { ReactElement } from 'react';

vi.mock('motion/react', async () => {
  const actual =
    await vi.importActual<typeof import('motion/react')>('motion/react');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from 'motion/react';

import { CaseAttemptView } from './case-attempt';

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

const stubCase = {
  id: '42',
  imageUrl: '/lesion-42.png',
  site: 'arm',
  patientAge: 42,
  clinicalNote: 'A pigmented lesion on the arm.',
};

// CaseAttemptView reads useViewTransitionState (#106), so it needs a data
// router. Mount it at the id-attempt route a Library card links to.
const renderInRouter = (ui: ReactElement) => {
  const router = createMemoryRouter(
    [{ path: '/app/cases/:id/attempt', element: ui }],
    { initialEntries: ['/app/cases/42/attempt'] },
  );
  return render(<RouterProvider router={router} />);
};

afterEach(() => {
  mockedUseReducedMotion.mockReturnValue(false);
});

describe('CaseAttemptView hero (#106)', () => {
  it('renders the case hero image', () => {
    renderInRouter(
      <CaseAttemptView
        caseItem={stubCase}
        committed={null}
        isPending={false}
        onCommit={() => {}}
      />,
    );

    expect(screen.getByAltText('Case 42')).toBeInTheDocument();
  });
});

describe('CaseAttemptView resolve polish (#98)', () => {
  const renderCommitting = () =>
    renderInRouter(
      <CaseAttemptView
        caseItem={stubCase}
        committed="benign"
        isPending={false}
        onCommit={() => {}}
        resolved={false}
        verdictNode={<p>verdict in place</p>}
      />,
    );

  it('recedes the unselected choices on commit, leaving the chosen card', () => {
    renderCommitting();

    const benign = screen.getByRole('button', { name: /benign/i });
    const malignant = screen.getByRole('button', { name: /malignant/i });
    const skip = screen.getByRole('button', { name: /skip/i });

    // The world narrows to the answer: the two unchosen cards recede.
    expect(malignant).toHaveAttribute('data-receding', 'true');
    expect(skip).toHaveAttribute('data-receding', 'true');
    // The chosen card holds — it is filling its ring, not receding.
    expect(benign).not.toHaveAttribute('data-receding', 'true');
  });

  it('does not recede the choices under reduced motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    renderCommitting();

    expect(
      screen.getByRole('button', { name: /malignant/i }),
    ).not.toHaveAttribute('data-receding', 'true');
  });

  it('swells the hero acknowledge glow on commit', () => {
    renderCommitting();

    expect(document.querySelector('[data-hero-glow]')).not.toBeNull();
  });

  it('shows no acknowledge glow before a commit', () => {
    renderInRouter(
      <CaseAttemptView
        caseItem={stubCase}
        committed={null}
        isPending={false}
        onCommit={() => {}}
        resolved={false}
        verdictNode={<p>verdict in place</p>}
      />,
    );

    expect(document.querySelector('[data-hero-glow]')).toBeNull();
  });

  it('shows no acknowledge glow under reduced motion', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    renderCommitting();

    expect(document.querySelector('[data-hero-glow]')).toBeNull();
  });
});

describe('CaseAttemptView verdict in place (#85)', () => {
  const renderWithVerdict = (resolved: boolean) =>
    renderInRouter(
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
