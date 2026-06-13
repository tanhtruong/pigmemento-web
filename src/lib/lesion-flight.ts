/**
 * Shared-element flight origin for the Library thumb → attempt hero hop (#55).
 *
 * The Library card records where its lesion image sits at click time; the
 * attempt surface consumes it exactly once and flies the print from that
 * rect into the hero frame. Module state on purpose: deep links, refreshes,
 * and history pops start with an empty module, so only click-originated
 * entries ever fly.
 */

export type LesionFlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type LesionFlightOrigin = {
  caseId: string;
  src: string;
  rect: LesionFlightRect;
  /** Computed border-radius of the card at lift-off. */
  radius: string;
  recordedAt: number;
};

let stored: LesionFlightOrigin | null = null;

/**
 * An origin older than this is stale — generous enough to cover a held
 * loader (#54) between click and attempt mount, short enough that a tab
 * parked on the Library never flies from a forgotten click.
 */
const FLIGHT_TTL_MS = 5000;

/**
 * Capture the flight origin from a Library case card. The rect comes from
 * the card's `[data-case-thumb]` frame (the image container, immune to the
 * hover scale on the img itself); the radius from the card.
 */
export const captureLesionFlight = (
  card: HTMLElement,
  caseId: string,
  src: string,
): void => {
  const thumb = card.querySelector<HTMLElement>('[data-case-thumb]') ?? card;
  const rect = thumb.getBoundingClientRect();
  stored = {
    caseId,
    src,
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    radius: getComputedStyle(card).borderRadius,
    recordedAt: Date.now(),
  };
};

export const consumeLesionFlight = (
  caseId: string,
): LesionFlightOrigin | null => {
  const origin = stored;
  stored = null;
  if (!origin || origin.caseId !== caseId) return null;
  if (Date.now() - origin.recordedAt > FLIGHT_TTL_MS) return null;
  return origin;
};

/**
 * Non-consuming look at a pending flight origin (#62). The route outlet peeks
 * during render — before the attempt surface consumes it — to decide whether a
 * descend hop should suppress its develop wash: a flight already narrates the
 * descend, so playing the wash too would be a double gesture.
 */
export const peekLesionFlight = (): LesionFlightOrigin | null => {
  if (!stored) return null;
  if (Date.now() - stored.recordedAt > FLIGHT_TTL_MS) return null;
  return stored;
};
