import { describe, it, expect } from 'vitest';

import { queryKeys, attemptAffectedKeys } from './query-keys';

describe('attemptAffectedKeys', () => {
  it('covers the case family, the attempts family, and progress stats', () => {
    expect(attemptAffectedKeys).toContainEqual(queryKeys.cases); // ['cases']
    expect(attemptAffectedKeys).toContainEqual(['attempts']);
    expect(attemptAffectedKeys).toContainEqual(queryKeys['me-stats']); // ['me','progress']
  });

  it("includes progress stats — the substring predicate it replaced missed 'me-stats'", () => {
    // ['me','progress'] has head 'me', which the old
    // head.includes('case'|'attempt'|'history'|'cases'|'random') predicate
    // never matched, so the dashboard stats went stale after a drill.
    expect(attemptAffectedKeys).toContainEqual(['me', 'progress']);
  });

  it('uses prefix keys so partial matching reaches the whole family', () => {
    // ['cases'] is the prefix for random-case (['cases','random']),
    // attempted-cases (['cases','attempted']), drill-cases, etc.
    expect(queryKeys['random-case'][0]).toBe('cases');
    expect(queryKeys['attempted-cases'][0]).toBe('cases');
  });
});
