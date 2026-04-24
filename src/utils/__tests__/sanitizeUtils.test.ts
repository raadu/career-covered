import { describe, it, expect } from 'vitest';
import { sanitize } from '../sanitizeUtils';

describe('sanitizeUtils', () => {
  it('returns empty string for null or undefined', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
  });

  it('returns plain text as is', () => {
    const input = 'Hello World';
    expect(sanitize(input)).toBe(input);
  });

  it('strips HTML tags', () => {
    const input = '<b>Hello</b> <i>World</i>';
    expect(sanitize(input)).toBe('Hello World');
  });

  it('strips script tags completely', () => {
    const input = 'Hello<script>alert("xss")</script> World';
    expect(sanitize(input)).toBe('Hello World');
  });

  it('strips attributes but keeps text', () => {
    const input = '<div class="test" onclick="alert(1)">Click me</div>';
    expect(sanitize(input)).toBe('Click me');
  });

  it('handles malformed HTML gracefully', () => {
    const input = '<u Unclosed tag and malicious <script>alert(1)</script>';
    const result = sanitize(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<u');
  });

  it('strips image tags with malicious handlers', () => {
    const input = '<img src=x onerror=alert(1)>';
    expect(sanitize(input)).toBe('');
  });
});
