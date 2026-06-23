export const queryKeys = {
  cases: ['cases'],
  case: (id: string) => ['cases', id],
  'random-case': ['cases', 'random'],
  'attempted-cases': ['cases', 'attempted'],
  'drill-cases': ['cases', 'drill'],
  'latest-attempt': (caseId: string) => ['attempts', 'latest', caseId],
  'mistake-cases': (limit: number) => ['cases', 'mistake', limit],
  'infer-case': (caseId?: string) => ['cases', 'infer', caseId],
  me: ['me'],
  'me-stats': ['me', 'progress'],
} as const;

/**
 * The cache entries an answered Attempt can change: the Case library and every
 * list derived from it (history, the next random draw), the per-Case attempt
 * records, and the learner's progress stats. Invalidate these after answering
 * so the dashboard, history, and library reflect the new Attempt. Prefix keys
 * (`['cases']`, `['attempts']`) cover their whole family via TanStack's partial
 * matching — one entry each, instead of substring-sniffing every cache key.
 */
export const attemptAffectedKeys = [
  queryKeys.cases, // ['cases'] — library, random draw, attempted, drill, mistake, infer
  ['attempts'], // latest-attempt(caseId)
  queryKeys['me-stats'], // progress stats on the dashboard
] as const;
