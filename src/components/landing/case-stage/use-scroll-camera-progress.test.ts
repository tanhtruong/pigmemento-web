import { renderHook } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';

const { createSpy, killSpy, loadGsapMock } = vi.hoisted(() => {
  const killSpy = vi.fn();
  const createSpy = vi
    .fn<
      (config: {
        trigger: Element;
        start: string;
        end: string;
        scrub: boolean;
        onUpdate: (self: { progress: number }) => void;
      }) => { kill: () => void }
    >()
    .mockReturnValue({ kill: killSpy });
  const loadGsapMock = vi.fn(async () => ({
    gsap: {},
    ScrollTrigger: { create: createSpy },
  }));
  return { createSpy, killSpy, loadGsapMock };
});

vi.mock('@/lib/lazy-gsap', () => ({ loadGsap: loadGsapMock }));

import { useScrollCameraProgress } from './use-scroll-camera-progress';

// Clear at the START of each test: testing-library's auto-cleanup unmounts the
// previous test's hook in afterEach (firing kill), so clearing in afterEach
// would leak that call into the next test.
beforeEach(() => {
  vi.clearAllMocks();
});

const triggerEl = () => ({ current: document.createElement('div') });

describe('useScrollCameraProgress', () => {
  it('installs nothing when disabled (reduced-motion / static — no scrub)', () => {
    const ref = { current: 0 };
    renderHook(() => useScrollCameraProgress(ref, triggerEl(), false));
    expect(loadGsapMock).not.toHaveBeenCalled();
  });

  it('installs nothing when the trigger element is not mounted yet', () => {
    const ref = { current: 0 };
    renderHook(() => useScrollCameraProgress(ref, { current: null }, true));
    expect(loadGsapMock).not.toHaveBeenCalled();
  });

  it('scrubs the frame transit into the ref when enabled', async () => {
    const ref = { current: 0 };
    const trigger = triggerEl();
    renderHook(() => useScrollCameraProgress(ref, trigger, true));

    await vi.waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
    const config = createSpy.mock.calls[0][0];
    expect(config.scrub).toBe(true);
    expect(config.trigger).toBe(trigger.current);
    expect(config.start).toBe('top bottom');
    expect(config.end).toBe('bottom top');

    config.onUpdate({ progress: 0.42 });
    expect(ref.current).toBe(0.42);
  });

  it('kills the trigger on cleanup', async () => {
    const ref = { current: 0 };
    const { unmount } = renderHook(() =>
      useScrollCameraProgress(ref, triggerEl(), true),
    );
    await vi.waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
    unmount();
    expect(killSpy).toHaveBeenCalledTimes(1);
  });
});
