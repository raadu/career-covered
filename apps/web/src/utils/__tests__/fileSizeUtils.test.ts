import { describe, it, expect } from 'vitest';
import { formatFileSize } from '../fileSizeUtils';

describe('formatFileSize', () => {
  it('formats zero bytes as 0 KB', () => {
    expect(formatFileSize(0)).toBe('0 KB');
  });

  it('formats sizes under 1MB in whole KB', () => {
    expect(formatFileSize(512 * 1024)).toBe('512 KB');
  });

  it('rounds KB to the nearest whole number', () => {
    expect(formatFileSize(1024 * 1023.6)).toBe('1024 KB');
  });

  it('formats exactly 1MB in MB with one decimal', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats sizes above 1MB in MB with one decimal', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
