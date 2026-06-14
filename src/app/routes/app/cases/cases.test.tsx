import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('@/features/cases/api/use-cases.ts', () => ({
  useCases: vi.fn(),
}));

import { useCases } from '@/features/cases/api/use-cases.ts';

import { consumeLesionFlight } from '@/lib/lesion-flight';

import CasesScene from './cases';

const mockedUseCases = vi.mocked(useCases);

const stubItem = {
  id: '1001',
  imageUrl: '/lesion-1001.png',
  difficulty: 'medium' as const,
  patientAge: 55,
  site: 'back',
  lastAttempt: null,
};

afterEach(() => {
  mockedUseCases.mockReset();
  consumeLesionFlight('__drain__');
});

const renderLibrary = () => {
  mockedUseCases.mockReturnValue({
    data: [stubItem],
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useCases>);
  return render(
    <MemoryRouter initialEntries={['/app/cases']}>
      <Routes>
        <Route path="/app/cases" element={<CasesScene />} />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('Library case card flight origin (#55)', () => {
  it('records the lesion flight origin when a case card is clicked', () => {
    renderLibrary();

    fireEvent.click(screen.getByRole('link', { name: /case · 1001/i }));

    const origin = consumeLesionFlight('1001');
    expect(origin).toMatchObject({
      caseId: '1001',
      src: '/lesion-1001.png',
    });
  });
});

describe('Library case card meta chips (#108)', () => {
  it('presents the clinical facts before difficulty: site → age → difficulty', () => {
    renderLibrary();

    const chips = {
      site: screen.getByText('back'),
      age: screen.getByText('55y'),
      difficulty: screen.getByText('medium'),
    };
    const rendered = Object.entries(chips)
      .sort(([, a], [, b]) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      )
      .map(([role]) => role);

    expect(rendered).toEqual(['site', 'age', 'difficulty']);
  });
});
