import { render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

// Control the capability gate per test; keep useRenderLoopActive real (false in
// jsdom — the canvas never intersects under the no-op IntersectionObserver).
vi.mock('@/lib/render-3d', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/render-3d')>();
  return { ...actual, useShouldRender3D: vi.fn(() => false) };
});

// Stub the lazy WebGL scene so jsdom never instantiates a real <Canvas>; we
// assert the wiring (gate → mount, `active` prop) rather than render WebGL.
vi.mock('./r3f-scene', () => ({
  default: (props: { active: boolean }) => (
    <div data-testid="r3f-scene" data-active={String(props.active)} />
  ),
}));

import { useShouldRender3D } from '@/lib/render-3d';
import { case001Breakdown } from '@/lib/landing-seed-data';
import { CaseStage } from './case-stage';

const mockedShould = vi.mocked(useShouldRender3D);

afterEach(() => {
  mockedShould.mockReturnValue(false);
});

const renderStage = () =>
  render(
    <CaseStage
      imageSrc="/ISIC_0000022.jpg"
      imageAlt="Dermoscopic image"
      features={case001Breakdown.features}
      sourceCredit="ISIC_0000022 · MELANOMA"
    />,
  );

describe('CaseStage', () => {
  it('renders only the static layer when the 3D gate fails (jsdom default)', () => {
    const { container } = renderStage();

    // The real, accessible content is present...
    expect(screen.getByAltText('Dermoscopic image')).toBeInTheDocument();
    expect(
      screen.getByText(/Asymmetric across the long axis/i),
    ).toBeInTheDocument();

    // ...and no 3D scene / canvas ever mounts.
    expect(screen.queryByTestId('r3f-scene')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('mounts the decorative 3D overlay after paint when capable, keeping the static layer', async () => {
    mockedShould.mockReturnValue(true);
    renderStage();

    // Mounts only after first paint (rAF in useMountedAfterPaint).
    const scene = await screen.findByTestId('r3f-scene');
    expect(scene).toBeInTheDocument();

    // Render loop is paused in jsdom (canvas never intersects) → active=false.
    expect(scene).toHaveAttribute('data-active', 'false');

    // The static layer stays mounted for a11y / SEO even with 3D active.
    expect(screen.getByAltText('Dermoscopic image')).toBeInTheDocument();
  });
});
