import { afterEach, describe, expect, it, vi } from 'vitest';

import { captureLesionFlight, consumeLesionFlight } from './lesion-flight';

const buildCard = () => {
  const card = document.createElement('a');
  const thumb = document.createElement('div');
  thumb.setAttribute('data-case-thumb', '');
  card.appendChild(thumb);
  document.body.appendChild(card);
  return { card, thumb };
};

afterEach(() => {
  document.body.innerHTML = '';
  // Drain any origin a test left behind — consume always clears.
  consumeLesionFlight('__drain__');
  vi.useRealTimers();
});

describe('lesion flight origin', () => {
  it('hands the captured origin to the matching case exactly once', () => {
    const { card } = buildCard();
    captureLesionFlight(card, '42', '/lesion-42.png');

    const origin = consumeLesionFlight('42');
    expect(origin).toMatchObject({ caseId: '42', src: '/lesion-42.png' });
    expect(origin?.rect).toBeDefined();

    expect(consumeLesionFlight('42')).toBeNull();
  });

  it('refuses an origin recorded for a different case — and discards it', () => {
    const { card } = buildCard();
    captureLesionFlight(card, '42', '/lesion-42.png');

    expect(consumeLesionFlight('7')).toBeNull();
    // The mismatched origin must not linger for a later matching consume.
    expect(consumeLesionFlight('42')).toBeNull();
  });

  it('refuses an origin gone stale — a long-parked tab must not fly', () => {
    vi.useFakeTimers();
    const { card } = buildCard();
    captureLesionFlight(card, '42', '/lesion-42.png');

    vi.advanceTimersByTime(10_000);

    expect(consumeLesionFlight('42')).toBeNull();
  });
});
