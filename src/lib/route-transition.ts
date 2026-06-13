const CASE_ATTEMPT_PATTERN = /^\/app\/cases\/[^/]+\/attempt$/;
const CASE_REVIEW_PATTERN = /^\/app\/cases\/[^/]+\/review$/;

/**
 * The in-app transition grammar (#53). Motion conjugates by the relationship
 * between the two *surfaces*, never by what triggered the hop — so browser
 * back/forward conjugate correctly for free.
 */
export type RouteTransitionVariant =
  | 'lateral-forward'
  | 'lateral-back'
  | 'descend'
  | 'ascend'
  | 'advance'
  | 'neutral'
  | 'none';

/**
 * Tab surfaces in bottom-bar order. Practice (index 0) is absent on purpose:
 * its target is a case-flow surface, so entering it reads as a descend, not
 * a lateral move.
 */
const TAB_ORDER: Record<string, number> = {
  '/app/cases': 1,
  '/app/dashboard': 2,
  '/app/profile': 3,
};

export const classifyRouteTransition = (
  from: string | undefined,
  to: string,
): RouteTransitionVariant => {
  if (from === undefined) return 'none';
  if (from === to) return 'none';
  // The attempt → review centerpiece dissolves in place (#68): no hard cut, but
  // no directional drift either — the verdict resolves where the question was,
  // so the shared lesion photo reads as staying put rather than sliding. (Other
  // flow → flow hops keep the `advance` drift below.)
  if (CASE_ATTEMPT_PATTERN.test(from) && CASE_REVIEW_PATTERN.test(to)) {
    return 'neutral';
  }

  const fromTab = TAB_ORDER[from];
  const toTab = TAB_ORDER[to];
  if (fromTab !== undefined && toTab !== undefined) {
    return toTab > fromTab ? 'lateral-forward' : 'lateral-back';
  }
  if (fromTab !== undefined && isFlowSurface(to)) return 'descend';
  if (isFlowSurface(from) && toTab !== undefined) return 'ascend';
  if (isFlowSurface(from) && isFlowSurface(to)) return 'advance';

  return 'neutral';
};

/**
 * Case-flow surfaces — the screens you work a case on: attempt (incl. the
 * random practice entry), review, drill.
 */
const FLOW_PATTERN = /^\/app\/cases\/(drill$|[^/]+\/(attempt|review)$)/;

const isFlowSurface = (path: string): boolean => FLOW_PATTERN.test(path);

export const shouldAnimateRouteTransition = (
  from: string | undefined,
  to: string,
): boolean => classifyRouteTransition(from, to) !== 'none';
