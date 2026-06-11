const CASE_ATTEMPT_PATTERN = /^\/app\/cases\/[^/]+\/attempt$/;
const CASE_REVIEW_PATTERN = /^\/app\/cases\/[^/]+\/review$/;

export const shouldAnimateRouteTransition = (
  from: string | undefined,
  to: string,
): boolean => {
  if (from === undefined) return false;
  if (from === to) return false;

  const isCenterpieceHop =
    CASE_ATTEMPT_PATTERN.test(from) && CASE_REVIEW_PATTERN.test(to);
  if (isCenterpieceHop) return false;

  return true;
};
