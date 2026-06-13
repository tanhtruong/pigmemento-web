/**
 * Shorten a case identifier for display.
 *
 * Case ids are GUIDs (`550e8400-e29b-41d4-a716-446655440000`); rendering the
 * full value alongside an already-present `CASE ·` prefix is noisy. We show the
 * first hyphen-delimited segment, uppercased (`550E8400`) — stable across a
 * case's lifetime and distinct enough to recognise at a glance.
 *
 * Non-GUID / empty ids degrade gracefully: the trimmed value is uppercased so
 * the label is never blank or misleading.
 */
export const shortCaseId = (id: string | number | null | undefined): string => {
  const raw = String(id ?? '').trim();
  if (!raw) return '';
  return raw.split('-')[0].toUpperCase();
};
