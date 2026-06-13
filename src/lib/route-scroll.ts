import type { RouteTransitionVariant } from '@/lib/route-transition';

/**
 * Grammar-aware scroll restoration (#63).
 *
 * Moving deeper or forward starts you at the top; coming *back* returns you to
 * where you were — ascending out of a case to the library lands you on the
 * case you were looking at, not the top of a long list. The position store is
 * module-level so it survives the route swap (the surface unmounts).
 */
const positions = new Map<string, number>();

/** Remember the scroll position of a surface as you leave it. */
export const rememberScroll = (path: string, y: number): void => {
  positions.set(path, y);
};

/**
 * Back/ascend return you somewhere you've been, so restore the saved scroll.
 * Forward, descend, advance, and lateral-forward all start fresh at the top.
 */
export const restoresScroll = (variant: RouteTransitionVariant): boolean =>
  variant === 'ascend' || variant === 'lateral-back';

/** The Y to scroll the incoming surface to: saved position on a restoring hop, else top. */
export const scrollTargetFor = (path: string, restore: boolean): number =>
  restore ? (positions.get(path) ?? 0) : 0;
