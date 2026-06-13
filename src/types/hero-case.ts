import type { Label } from '@/features/cases/types/case-label.ts';

/**
 * The single playable case embedded in the landing hero. A new user judges it
 * (Melanoma / Benign) before signing up — the product made self-evident in the
 * first ten seconds. The case-number spine starts here at "Case 001"; the
 * centerpiece then breaks down this exact lesion as the expert payoff.
 */
export type HeroCase = {
  /** Display id — the case-number spine starts here ("Case 001"). */
  id: string;
  /** 4:5 portrait dermoscopy image. */
  imageSrc: string;
  imageAlt: string;
  /**
   * Mono-caps attribution shown beneath the lesion. Deliberately carries NO
   * diagnosis before the user answers — the credit must not spoil the call.
   */
  sourceCredit: string;
  /** Ground truth the Melanoma/Benign tap is checked against. */
  correctLabel: Label;
  /** One-line truth revealed after answering — e.g. "It’s a melanoma." */
  truth: string;
  /**
   * A single teaching cue. Kept deliberately short: the centerpiece carries the
   * full ABCDE breakdown of this same case, so the hero must not pre-empt it.
   */
  cue: string;
};
