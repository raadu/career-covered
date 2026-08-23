import { describe, it, expect } from 'vitest';
import {
  PROVIDER_NAME,
  PROVIDER_URL,
  DEFAULT_MODEL,
  AVAILABLE_MODELS,
} from '../AIModelUtils';
import { GROQ_BASE_URL, API_ENDPOINTS } from '../apiConfigUtils';

describe('Config Utilities', () => {
  describe('AIModelUtils', () => {
    it('should have correct provider information', () => {
      expect(PROVIDER_NAME).toBeDefined();
      expect(typeof PROVIDER_NAME).toBe('string');
      expect(PROVIDER_URL).toContain('http');
    });

    it('should default to the GPT-OSS 120B model', () => {
      expect(DEFAULT_MODEL).toBe('openai/gpt-oss-120b');
    });

    it('should expose exactly 2 selectable models with unique ids', () => {
      expect(AVAILABLE_MODELS).toHaveLength(2);
      const ids = AVAILABLE_MODELS.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(DEFAULT_MODEL);
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
