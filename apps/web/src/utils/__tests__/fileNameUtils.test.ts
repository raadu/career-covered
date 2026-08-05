import { describe, it, expect } from 'vitest';
import { buildFileName } from '../fileNameUtils';

describe('buildFileName', () => {
  it('returns Cover_Letter when name is null', () => {
    expect(buildFileName(null)).toBe('Cover_Letter');
  });

  it('returns Cover_Letter when name is undefined', () => {
    expect(buildFileName(undefined)).toBe('Cover_Letter');
  });

  it('returns Cover_Letter when name is empty string', () => {
    expect(buildFileName('')).toBe('Cover_Letter');
  });

  it('returns Cover_Letter when name is only whitespace', () => {
    expect(buildFileName('   ')).toBe('Cover_Letter');
  });

  it('returns Cover_Letter when called without arguments', () => {
    expect(buildFileName()).toBe('Cover_Letter');
  });

  it('handles a single-word name', () => {
    expect(buildFileName('John')).toBe('Cover_Letter_John');
  });

  it('handles a two-word first/last name', () => {
    expect(buildFileName('John Smith')).toBe('Cover_Letter_John_Smith');
  });

  it('separates every word of a three-word name', () => {
    expect(buildFileName('Helena Mann Dzousa')).toBe(
      'Cover_Letter_Helena_Mann_Dzousa',
    );
  });

  it('separates every word of a four-word name', () => {
    expect(buildFileName('Mary Jane Watson Parker')).toBe(
      'Cover_Letter_Mary_Jane_Watson_Parker',
    );
  });

  it('trims leading and trailing whitespace', () => {
    expect(buildFileName('  John  Smith  ')).toBe('Cover_Letter_John_Smith');
  });

  it('collapses multiple consecutive spaces into one underscore', () => {
    expect(buildFileName('John   Smith')).toBe('Cover_Letter_John_Smith');
  });

  it('collapses tabs and newlines into single underscores', () => {
    expect(buildFileName('John\tSmith\nDoe')).toBe(
      'Cover_Letter_John_Smith_Doe',
    );
  });
});
