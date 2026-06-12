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
