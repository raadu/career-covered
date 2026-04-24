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
    it('should have a valid base URL', () => {
      expect(GROQ_BASE_URL).toContain('https://api.groq.com');
    });

    it('should have correct endpoints', () => {
      expect(API_ENDPOINTS.CHAT_COMPLETIONS).toBe('/chat/completions');
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
