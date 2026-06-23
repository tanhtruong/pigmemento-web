import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

// The cinematic Act mounts WebGL + GSAP behind Suspense; stub it so this test
// covers the static-first landing (hero, method, FAQ, CTA, JSON-LD) that renders
// without WebGL. The Act's examine→commit→verdict is exercised at /dev/lesion-act.
vi.mock('@/components/landing/act-stage/landing-act-stage', () => ({
  default: () => <div data-testid="act-stage" />,
}));
// The method section now hosts the WebGL specimen library — stub it too; its
// four reads + the static fallback are covered in landing-library-stage.test.tsx.
vi.mock('@/components/landing/library-stage/landing-library-stage', () => ({
  default: () => <div data-testid="library-stage" />,
}));

import LandingRoute from './landing';

const renderLanding = () => {
  const router = createMemoryRouter(
    [{ path: '/', element: <LandingRoute /> }],
    {
      initialEntries: ['/'],
    },
  );
  return render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>,
  );
};

describe('landing route', () => {
  it('renders the hero headline', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /Make the call\./,
    );
  });

  it('mounts the specimen-library set-piece under the method heading', () => {
    renderLanding();
    // The four reads moved from a static grid into the library set-piece (lazy,
    // stubbed here; covered in landing-library-stage.test.tsx). The section
    // heading stays as the accessible landmark.
    expect(
      screen.getByRole('heading', { name: /looking, made knowing\./i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('library-stage')).toBeInTheDocument();
  });

  it('renders the FAQ content', () => {
    renderLanding();
    expect(screen.getByText(/Who is Pigmemento for\?/i)).toBeInTheDocument();
  });

  it('closes with the CTA band and a register link', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: /ready to make the call\?/i }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /start your first case/i });
    expect(cta.getAttribute('href')).toMatch(/register/);
  });

  it('embeds FAQPage + Organization JSON-LD', () => {
    const { container } = renderLanding();
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBeGreaterThanOrEqual(1);
    const payload = Array.from(scripts)
      .map((s) => s.textContent ?? '')
      .join('');
    expect(payload).toContain('"FAQPage"');
    expect(payload).toContain('"Organization"');
  });

  it('renders the educational-use disclaimer', () => {
    renderLanding();
    expect(
      screen.getByText(/Educational use only\. Not for diagnosis\./i),
    ).toBeInTheDocument();
  });
});
