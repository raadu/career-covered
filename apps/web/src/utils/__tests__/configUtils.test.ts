import { describe, it, expect } from 'vitest';
import { PROVIDER_NAME, PROVIDER_URL, DEFAULT_MODEL } from '../AIModelUtils';
import { GROQ_BASE_URL, API_ENDPOINTS } from '../apiConfigUtils';
import { AVAILABLE_MODELS } from '../modelsInfoUtils';

describe('Config Utilities', () => {
  describe('AIModelUtils', () => {
    it('should have correct provider information', () => {
      expect(PROVIDER_NAME).toBeDefined();
      expect(typeof PROVIDER_NAME).toBe('string');
      expect(PROVIDER_URL).toContain('http');
    });

    it('should have a default model', () => {
      expect(DEFAULT_MODEL).toBeDefined();
      expect(AVAILABLE_MODELS.some(m => m.id === DEFAULT_MODEL)).toBe(true);
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

  describe('modelsInfoUtils', () => {
    it('should export an array of available models', () => {
      expect(Array.isArray(AVAILABLE_MODELS)).toBe(true);
      expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
    });

    it('should have valid model structure', () => {
      AVAILABLE_MODELS.forEach(model => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
      });
    });
  });
});
