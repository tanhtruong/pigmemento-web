import { describe, it, expect } from 'vitest';

import { shortCaseId } from './case-id';

describe('shortCaseId', () => {
  it('shows the first GUID segment, uppercased', () => {
    expect(shortCaseId('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550E8400',
    );
  });

  it('uppercases a value with no hyphen', () => {
    expect(shortCaseId('abc123')).toBe('ABC123');
  });

  it('accepts numeric ids', () => {
    expect(shortCaseId(42)).toBe('42');
  });

  it('trims surrounding whitespace', () => {
    expect(shortCaseId('  9f8b-rest  ')).toBe('9F8B');
  });

  it('returns an empty string for empty / nullish input', () => {
    expect(shortCaseId('')).toBe('');
    expect(shortCaseId(null)).toBe('');
    expect(shortCaseId(undefined)).toBe('');
  });
});
