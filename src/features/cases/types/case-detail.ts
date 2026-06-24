import type { AbcdeFeature } from '@/types/abcde-feature';

export interface CaseDetail {
  id: string;
  imageUrl: string;
  patientAge: number;
  site: string;
  clinicalNote: string;
  /**
   * Optional ABCDE annotations for the case lesion.
   *
   * Populated by the clinical content team for cases that should drive the
   * annotated answer-reveal walk-through (slice #11). When absent or empty,
   * the answer-reveal falls back to the baseline sweep-only choreography from
   * slice #5.
   */
  abcdeFeatures?: AbcdeFeature[];
}
