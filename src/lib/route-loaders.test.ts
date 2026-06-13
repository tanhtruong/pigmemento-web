import { describe, it, expect, vi, afterEach } from 'vitest';

import { PREFETCH_CAP_MS, prefetchWithCap } from './route-loaders';

afterEach(() => {
  vi.useRealTimers();
});

describe('prefetchWithCap', () => {
  it('resolves to null as soon as the prefetch resolves (well under the cap)', async () => {
    const prefetch = Promise.resolve('case-data');
    await expect(prefetchWithCap(prefetch, 10_000)).resolves.toBeNull();
  });

  it('resolves at the cap when the prefetch is slow, without blocking on it', async () => {
    vi.useFakeTimers();
    // A prefetch that never settles within the test — the cap must win.
    const neverResolves = new Promise(() => {});
    const result = prefetchWithCap(neverResolves, 600);

    await vi.advanceTimersByTimeAsync(599);
    let settled = false;
    void result.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBeNull();
  });

  it('swallows a prefetch rejection — timing only, never throws', async () => {
    const rejecting = Promise.reject(new Error('network down'));
    await expect(prefetchWithCap(rejecting, 10_000)).resolves.toBeNull();
  });

  it('defaults the cap to PREFETCH_CAP_MS', async () => {
    vi.useFakeTimers();
    const result = prefetchWithCap(new Promise(() => {}));
    await vi.advanceTimersByTimeAsync(PREFETCH_CAP_MS);
    await expect(result).resolves.toBeNull();
  });
});
