import { describe, it, expect } from 'vitest';
import formatDate from '../dateUtils';

describe('formatDate', () => {
  it('formats an ISO date string as "MMM D, YYYY"', () => {
    expect(formatDate('2026-08-05T00:00:00.000Z')).toBe('Aug 5, 2026');
  });

  it('falls back to the raw input when the date cannot be formatted', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
