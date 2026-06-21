import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect, vi } from 'vitest';

// Control the capability gate per test; keep useRenderLoopActive real (false in
// jsdom — the canvas never intersects under the no-op IntersectionObserver).
vi.mock('@/lib/render-3d', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/render-3d')>();
  return { ...actual, useShouldRender3D: vi.fn(() => false) };
});

// Isolate the gate wiring from the GSAP scroll side-effect (covered in
// use-scroll-camera-progress.test). Keeps the real lazy gsap import — which
// resolves after teardown — out of this file's run.
vi.mock('./use-scroll-camera-progress', () => ({
  useScrollCameraProgress: () => {},
}));

// Stub the lazy WebGL scene so jsdom never instantiates a real <Canvas>; we
// assert the wiring (gate → mount, `active` prop) rather than render WebGL.
vi.mock('./r3f-scene', () => ({
  default: (props: { active: boolean; onDegrade?: () => void }) => (
    <div data-testid="r3f-scene" data-active={String(props.active)}>
      {/* Lets a test drive the perf-floor bail without a real PerformanceMonitor. */}
      <button data-testid="degrade" onClick={() => props.onDegrade?.()} />
    </div>
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

  it('bails to the static layer when adaptive quality drops below the floor', async () => {
    mockedShould.mockReturnValue(true);
    const user = userEvent.setup();
    renderStage();

    await screen.findByTestId('r3f-scene');
    await user.click(screen.getByTestId('degrade'));

    // 3D is torn down and stays down; the static layer carries on.
    expect(screen.queryByTestId('r3f-scene')).toBeNull();
    expect(screen.getByAltText('Dermoscopic image')).toBeInTheDocument();
  });
});
