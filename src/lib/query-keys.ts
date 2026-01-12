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
