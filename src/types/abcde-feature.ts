export interface AbcdeFeature {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  centerPoint: [number, number];
  reasoning: string;
}

export const hasAbcdeFeatures = <T extends { abcdeFeatures?: AbcdeFeature[] }>(
  c: T,
): c is T & { abcdeFeatures: AbcdeFeature[] } => {
  return Array.isArray(c.abcdeFeatures) && c.abcdeFeatures.length > 0;
};
