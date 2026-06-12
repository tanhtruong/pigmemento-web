/**
 * Viewport coordinates of a commit gesture — the center of the element the
 * user just acted on. This is where the conductor's bloom originates.
 * Falls back to the viewport center if the element unmounted under us.
 */
export const commitOrigin = (
  element: Element | null,
): { x: number; y: number } => {
  const rect = element?.getBoundingClientRect();
  if (!rect) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Bloom origin from a click-like event: the pointer position for mouse and
 * touch, the element center for keyboard activation (whose synthesized
 * clicks report clientX/clientY as 0,0).
 */
export const gestureOrigin = (event: {
  clientX: number;
  clientY: number;
  currentTarget: Element;
}): { x: number; y: number } => {
  if (event.clientX || event.clientY) {
    return { x: event.clientX, y: event.clientY };
  }
  return commitOrigin(event.currentTarget);
};
