import { describe, it, expect } from 'vitest';
import {
  hideBelowClass,
  tableActionButtonClass,
  DEFAULT_PAGE_SIZES,
} from '../tableColumnMeta';

describe('hideBelowClass', () => {
  it('returns an empty string when no breakpoint is given', () => {
    expect(hideBelowClass(undefined)).toBe('');
  });

  it('hides below sm and shows as a table cell at sm and up', () => {
    expect(hideBelowClass('sm')).toBe('hidden sm:table-cell');
  });

  it('hides below md and shows as a table cell at md and up', () => {
    expect(hideBelowClass('md')).toBe('hidden md:table-cell');
  });

  it('hides below lg and shows as a table cell at lg and up', () => {
    expect(hideBelowClass('lg')).toBe('hidden lg:table-cell');
  });
});

describe('tableActionButtonClass', () => {
  it('enforces a 40px minimum touch target', () => {
    expect(tableActionButtonClass).toContain('min-h-10');
    expect(tableActionButtonClass).toContain('min-w-10');
  });
});

describe('DEFAULT_PAGE_SIZES', () => {
  it('starts at 10 and is sorted ascending', () => {
    expect(DEFAULT_PAGE_SIZES[0]).toBe(10);
    expect(DEFAULT_PAGE_SIZES).toEqual(
      [...DEFAULT_PAGE_SIZES].sort((a, b) => a - b),
    );
  });
});
