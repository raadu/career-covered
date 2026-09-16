import { describe, it, expect } from 'vitest';
import { getMarketRules } from '../marketPrompts';

describe('marketPrompts', () => {
  describe('getMarketRules', () => {
    it('returns the international guidelines by default market', () => {
      const result = getMarketRules('international');
      expect(result).toContain(
        'Job Market: International (US, Remote and most global companies)',
      );
      expect(result).toContain('Focus on value and measurable achievements.');
      expect(result).toContain('confident call for further discussion');
    });

    it('returns Sweden-specific guidelines', () => {
      const result = getMarketRules('sweden');
      expect(result).toContain('Job Market: Sweden');
      expect(result).toContain('Be humble, genuine and professional.');
      expect(result).toContain('Avoid generic buzzwords and clichés.');
      expect(result).not.toContain('International (US');
    });

    it('returns Bangladesh-specific guidelines', () => {
      const result = getMarketRules('bangladesh');
      expect(result).toContain('Job Market: Bangladesh');
      expect(result).toContain('Be respectful and formal.');
      expect(result).toContain(
        'express availability for an interview',
      );
      expect(result).not.toContain('International (US');
    });

    it('produces different guideline text for each market', () => {
      const international = getMarketRules('international');
      const sweden = getMarketRules('sweden');
      const bangladesh = getMarketRules('bangladesh');

      expect(international).not.toBe(sweden);
      expect(sweden).not.toBe(bangladesh);
      expect(international).not.toBe(bangladesh);
    });

    it('always names the market twice: once as the header, once before the guidelines', () => {
      const result = getMarketRules('sweden');
      const occurrences = result.split('Sweden').length - 1;
      expect(occurrences).toBeGreaterThanOrEqual(2);
    });
  });
});
