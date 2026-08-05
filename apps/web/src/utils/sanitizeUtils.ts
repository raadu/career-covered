import DOMPurify from 'dompurify';

/**
 * Sanitizes a string input to prevent XSS attacks.
 * It strips out HTML tags and attributes while preserving the text content.
 *
 * @param input - The string to sanitize.
 * @returns A safe, sanitized string.
 */
export const sanitize = (input: string | null | undefined): string => {
  if (input === null || input === undefined) {
    return '';
  }

  // If we are in a non-browser environment (like some test setups without JSDOM),
  // DOMPurify might need a window object. But vitest-jsdom should provide it.
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  });
};
