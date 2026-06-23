/**
 * The specimen library for the set-piece (PIG-161) — the 24 real ISIC images in
 * `public/isic/` (ISIC_0000048 … ISIC_0000071), uniform 4:3. These stream as the
 * horizontal stage; later slices add per-specimen data (truth, teaching) for the
 * four lock-in beats (#163). Progressive loading of the set is #164.
 */
export const LIBRARY_SPECIMENS: readonly string[] = Array.from(
  { length: 24 },
  (_, i) => `/isic/ISIC_${String(48 + i).padStart(7, '0')}.jpg`,
);
