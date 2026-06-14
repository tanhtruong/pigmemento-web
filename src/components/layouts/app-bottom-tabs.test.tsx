import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppBottomTabs } from './app-bottom-tabs';

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    [{ path: '/app/*', element: <AppBottomTabs /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
};

const namedIndicators = (root: ParentNode) =>
  root.querySelectorAll('[style*="view-transition-name"]');

describe('AppBottomTabs — morphing indicator (#104)', () => {
  it("names exactly one dot — the active tab's — so the morph never duplicate-aborts", () => {
    const { container } = renderAt('/app/cases');
    // Four dots are rendered (one per tab); only the active one is named.
    expect(namedIndicators(container)).toHaveLength(1);
    expect(
      namedIndicators(screen.getByRole('link', { name: /library/i })),
    ).toHaveLength(1);
  });

  it('moves the named indicator to whichever tab is current', () => {
    renderAt('/app/profile');
    expect(
      namedIndicators(screen.getByRole('link', { name: /profile/i })),
    ).toHaveLength(1);
    expect(
      namedIndicators(screen.getByRole('link', { name: /library/i })),
    ).toHaveLength(0);
  });
});
