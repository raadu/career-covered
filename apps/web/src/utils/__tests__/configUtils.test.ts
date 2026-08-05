import { describe, it, expect } from 'vitest';
import { PROVIDER_NAME, PROVIDER_URL, DEFAULT_MODEL } from '../AIModelUtils';
import { GROQ_BASE_URL, API_ENDPOINTS } from '../apiConfigUtils';

describe('Config Utilities', () => {
  describe('AIModelUtils', () => {
    it('should have correct provider information', () => {
      expect(PROVIDER_NAME).toBeDefined();
      expect(typeof PROVIDER_NAME).toBe('string');
      expect(PROVIDER_URL).toContain('http');
    });

    it('should default to the Llama 3.3 70B model', () => {
      expect(DEFAULT_MODEL).toBe('llama-3.3-70b-versatile');
    });
  });

  describe('apiConfigUtils', () => {
    it('should use proxy base URL', () => {
      expect(GROQ_BASE_URL).toBe('/api');
    });

    it('should have correct proxy endpoint', () => {
      expect(API_ENDPOINTS.CHAT_COMPLETIONS).toBe('/generate');
    });
  });
});
