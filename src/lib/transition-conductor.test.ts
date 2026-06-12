import { describe, it, expect } from 'vitest';

import {
  bloomGeometry,
  conductorTimings,
  initialConductorState,
  reduceConductor,
  shouldFireNavigate,
} from './transition-conductor';
import { motionDurations } from './motion-tokens';

const startEvent = {
  type: 'START',
  request: {
    kind: 'enter-app',
    origin: { x: 180, y: 420 },
    destination: '/app/dashboard',
  },
} as const;

describe('transition conductor state machine', () => {
  it('START from idle begins blooming with the requested transition', () => {
    const next = reduceConductor(initialConductorState, startEvent);

    expect(next.phase).toBe('blooming');
    expect(next.transition).toEqual(startEvent.request);
  });

  it('reaching the bloom apex moves to holding and signals navigation once', () => {
    const blooming = reduceConductor(initialConductorState, startEvent);
    const holding = reduceConductor(blooming, {
      type: 'APEX_REACHED',
      generation: blooming.generation,
    });

    expect(holding.phase).toBe('holding');
    expect(shouldFireNavigate(blooming, holding)).toBe(true);
    // Re-render with unchanged state must not navigate again.
    expect(shouldFireNavigate(holding, holding)).toBe(false);
  });

  it('dissolves once the destination route has actually mounted', () => {
    const blooming = reduceConductor(initialConductorState, startEvent);
    const holding = reduceConductor(blooming, {
      type: 'APEX_REACHED',
      generation: blooming.generation,
    });

    const dissolving = reduceConductor(holding, { type: 'LOCATION_CHANGED' });

    expect(dissolving.phase).toBe('dissolving');
    // The overlay still needs the transition (palette, kind) while fading out.
    expect(dissolving.transition).toEqual(startEvent.request);
  });

  it('returns to idle with no transition once the dissolve finishes', () => {
    const blooming = reduceConductor(initialConductorState, startEvent);
    const holding = reduceConductor(blooming, {
      type: 'APEX_REACHED',
      generation: blooming.generation,
    });
    const dissolving = reduceConductor(holding, { type: 'LOCATION_CHANGED' });

    const idle = reduceConductor(dissolving, {
      type: 'DISSOLVE_DONE',
      generation: dissolving.generation,
    });

    expect(idle.phase).toBe('idle');
    expect(idle.transition).toBeNull();
  });

  it('a second START mid-flight cancels the first and restarts the bloom', () => {
    const first = reduceConductor(initialConductorState, startEvent);

    const secondRequest = {
      kind: 'enter-auth',
      origin: { x: 900, y: 80 },
      destination: '/auth/login',
    } as const;
    const second = reduceConductor(first, {
      type: 'START',
      request: secondRequest,
    });

    expect(second.phase).toBe('blooming');
    expect(second.transition).toEqual(secondRequest);
    expect(second.generation).not.toBe(first.generation);
  });

  it('ignores a stale apex from a cancelled transition — never navigates early', () => {
    const first = reduceConductor(initialConductorState, startEvent);
    const second = reduceConductor(first, {
      type: 'START',
      request: {
        kind: 'enter-auth',
        origin: { x: 900, y: 80 },
        destination: '/auth/login',
      },
    });

    // The first bloom's timer fires after the cancel — carries the old generation.
    const afterStaleApex = reduceConductor(second, {
      type: 'APEX_REACHED',
      generation: first.generation,
    });

    expect(afterStaleApex).toBe(second);
    expect(shouldFireNavigate(second, afterStaleApex)).toBe(false);
  });

  it('stays idle through ordinary navigation it did not initiate', () => {
    const next = reduceConductor(initialConductorState, {
      type: 'LOCATION_CHANGED',
    });

    expect(next).toBe(initialConductorState);
  });

  it('only dissolves on a location change while holding — not mid-bloom', () => {
    const blooming = reduceConductor(initialConductorState, startEvent);

    // e.g. a browser back-button press racing the bloom.
    const next = reduceConductor(blooming, { type: 'LOCATION_CHANGED' });

    expect(next.phase).toBe('blooming');
  });
});

describe('conductorTimings', () => {
  it('draws every duration from the shared motion vocabulary', () => {
    const timings = conductorTimings(false);

    expect(timings.bloomMs).toBe(motionDurations.considered * 1000);
    expect(timings.dissolveMs).toBe(motionDurations.hero * 1000);
  });

  it('collapses to instant cuts under reduced motion — same machine, zero cinema', () => {
    expect(conductorTimings(true)).toEqual({ bloomMs: 0, dissolveMs: 0 });
  });
});

describe('bloomGeometry', () => {
  const viewport = { width: 1280, height: 800 };
  const corners = [
    { x: 0, y: 0 },
    { x: viewport.width, y: 0 },
    { x: 0, y: viewport.height },
    { x: viewport.width, y: viewport.height },
  ];

  it.each([
    ['a corner CTA (landing FAB)', { x: 1230, y: 750 }],
    ['a centered submit button', { x: 640, y: 520 }],
    ['the top-left hero CTA', { x: 120, y: 300 }],
  ])(
    'centers the disc on the origin and its solid core covers every corner — %s',
    (_label, origin) => {
      const disc = bloomGeometry(origin, viewport);

      // Disc is a square centered on the click point.
      expect(disc.left + disc.size / 2).toBeCloseTo(origin.x);
      expect(disc.top + disc.size / 2).toBeCloseTo(origin.y);

      // The opaque core (inner 70% of the radius) must reach past the
      // farthest corner, or the apex leaves an uncovered feathered ring.
      const coreRadius = (disc.size / 2) * 0.7;
      for (const corner of corners) {
        const distance = Math.hypot(corner.x - origin.x, corner.y - origin.y);
        expect(coreRadius).toBeGreaterThanOrEqual(distance);
      }
    },
  );
});
