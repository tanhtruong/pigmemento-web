import {
  classifyRouteTransition,
  type RouteTransitionVariant,
} from './route-transition';
import { restoresScroll } from './route-scroll';

export type InAppTransitionMode = 'view-transition' | 'instant';

export type InAppTransitionPlan = {
  mode: InAppTransitionMode;
  variant: RouteTransitionVariant;
  restoreScroll: boolean;
};

export type InAppTransitionInput = {
  from: string | undefined;
  to: string;
  reducedMotion: boolean;
  supportsVT: boolean;
};

export const planInAppTransition = ({
  from,
  to,
  reducedMotion,
  supportsVT,
}: InAppTransitionInput): InAppTransitionPlan => {
  const variant = classifyRouteTransition(from, to);
  const canAnimate = supportsVT && !reducedMotion && variant !== 'none';
  return {
    mode: canAnimate ? 'view-transition' : 'instant',
    variant,
    restoreScroll: restoresScroll(variant),
  };
};
