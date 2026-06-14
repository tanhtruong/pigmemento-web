import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

vi.mock('@/features/cases/api/use-cases.ts', () => ({
  useCases: vi.fn(),
}));

import { useCases } from '@/features/cases/api/use-cases.ts';

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
});

const renderLibrary = () => {
  mockedUseCases.mockReturnValue({
    data: [stubItem],
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useCases>);
  const router = createMemoryRouter(
    [
      { path: '/app/cases', element: <CasesScene /> },
      { path: '*', element: <div>elsewhere</div> },
    ],
    { initialEntries: ['/app/cases'] },
  );
  return render(<RouterProvider router={router} />);
};

describe('Library case card (#106)', () => {
  it('links each case card to its attempt route', () => {
    renderLibrary();

    expect(screen.getByRole('link', { name: /case · 1001/i })).toHaveAttribute(
      'href',
      '/app/cases/1001/attempt',
    );
  });
});
