import { describe, it, expect } from 'vitest';
import { buildCoverLetterPrompt, formatCustomPrompt } from '../promptUtils';

describe('promptUtils', () => {
    describe('formatCustomPrompt', () => {
        it('should return empty string for empty or whitespace input', () => {
            expect(formatCustomPrompt('')).toBe('');
            expect(formatCustomPrompt('   ')).toBe('');
            expect(formatCustomPrompt(undefined)).toBe('');
        });

        it('should format valid custom prompt correctly', () => {
            const input = 'Use a confident tone';
            expect(formatCustomPrompt(input)).toContain('Additional user instruction: Use a confident tone');
        });

        it('should sanitize malicious code in custom prompt', () => {
            const maliciousInput = 'Use a confident tone <script>alert("xss")</script>';
            const result = formatCustomPrompt(maliciousInput);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('alert');
            // Check that it still contains the safe parts
            expect(result).toContain('Additional user instruction: Use a confident tone');
        });
    });

    describe('buildCoverLetterPrompt', () => {
        const jobDescription = 'Software Engineer at Google';
        const template = 'I am a developer.';

        it('should build a prompt with job description and template', () => {
            const result = buildCoverLetterPrompt(jobDescription, template);
            expect(result).toContain(jobDescription);
            expect(result).toContain(template);
            expect(result).toContain('Keep it concise');
        });

        it('should include word count limit when provided', () => {
            const result = buildCoverLetterPrompt(jobDescription, template, 200);
            expect(result).toContain('Write the cover letter in 200 words');
        });

        it('should handle missing template correctly', () => {
            const result = buildCoverLetterPrompt(jobDescription, '');
            expect(result).toContain("User has not provided a template.");
        });

        it('should sanitize malicious code in job description and template', () => {
            const maliciousJD = 'Software Engineer <img src=x onerror=alert(1)>';
            const maliciousTemplate = 'Template <iframe src="javascript:alert(1)"></iframe>';
            const result = buildCoverLetterPrompt(maliciousJD, maliciousTemplate);
            
            expect(result).not.toContain('<img');
            expect(result).not.toContain('onerror');
            expect(result).not.toContain('<iframe');
            expect(result).not.toContain('javascript:');
            expect(result).toContain('Software Engineer');
            expect(result).toContain('Template');
        });

        it('should handle special characters correctly', () => {
            const specialChars = '!@#$%^&*()_+{}|:"';
            const result = buildCoverLetterPrompt(specialChars, template);
            // Some characters might be escaped or handled differently by DOMPurify, 
            // but these basic ones should be fine.
            expect(result).toContain('!@#$%^&*()_+{}|:');
        });
    });
});
