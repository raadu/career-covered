import { describe, it, expect } from 'vitest';
import { buildCoverLetterPrompt } from '../promptUtils';

describe('promptUtils', () => {
    describe('buildCoverLetterPrompt', () => {
        it('should build a prompt with job description and template', () => {
            const jobDescription = 'Software Engineer at Google';
            const template = 'I am a developer.';
            const result = buildCoverLetterPrompt(jobDescription, template);
            
            expect(result).toContain(jobDescription);
            expect(result).toContain(template);
            expect(result).toContain('Keep it concise (under 400 words)');
        });

        it('should include word count limit when provided', () => {
            const result = buildCoverLetterPrompt('JD', 'Template', 200);
            expect(result).toContain('Write the cover letter in 200 words');
        });

        it('should include custom prompt when provided', () => {
            const result = buildCoverLetterPrompt('JD', 'Template', null, true, 'Add more humor');
            expect(result).toContain('Additional user instruction: Add more humor');
        });

        it('should handle minimalChanges being false', () => {
            const result = buildCoverLetterPrompt('JD', 'Template', null, false);
            expect(result).toContain('You can use professional tone to change the related skills and motivation');
        });
    });
});
