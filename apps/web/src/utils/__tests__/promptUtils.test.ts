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
      const result = formatCustomPrompt(input);
      expect(result).toContain('Additional user instruction:');
      expect(result).toContain('Use a confident tone');
    });

    it('should sanitize malicious code in custom prompt', () => {
      const maliciousInput =
        'Use a confident tone <script>alert("xss")</script>';
      const result = formatCustomPrompt(maliciousInput);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Additional user instruction:');
    });
  });

  describe('buildCoverLetterPrompt', () => {
    const jobDescription = 'Software Engineer at Google';
    const template = 'I am a developer.';

    it('should build a prompt with job description and template', () => {
      const result = buildCoverLetterPrompt(jobDescription, template);
      expect(result).toContain(jobDescription);
      expect(result).toContain(template);
      expect(result).toContain('expert career coach');
    });

    it('should include word count limit when provided', () => {
      const result = buildCoverLetterPrompt(jobDescription, template, 200);
      expect(result).toContain('Word limit: 200 words maximum');
    });

    it('should include a character limit when provided, and not the default fallback', () => {
      const result = buildCoverLetterPrompt(
        jobDescription,
        template,
        null,
        'balanced',
        false,
        undefined,
        'international',
        null,
        2000,
      );
      expect(result).toContain(
        'Character limit: 2000 characters maximum, including spaces',
      );
      expect(result).not.toContain('Write between 250 and 400 words.');
      expect(result).not.toContain('Word limit:');
    });

    it('tells the model the length limit outranks the paragraph structure rules', () => {
      const wordResult = buildCoverLetterPrompt(jobDescription, template, 60);
      expect(wordResult).toContain('takes priority over the paragraph structure below');

      const charResult = buildCoverLetterPrompt(
        jobDescription,
        template,
        null,
        'balanced',
        false,
        undefined,
        'international',
        null,
        200,
      );
      expect(charResult).toContain(
        'takes priority over the paragraph structure below',
      );
    });

    it('falls back to the default word-range guidance when neither limit is set', () => {
      const result = buildCoverLetterPrompt(jobDescription, template);
      expect(result).toContain('Write between 250 and 400 words.');
    });

    it('falls back to the default word-range guidance when the limits are explicitly 0', () => {
      const result = buildCoverLetterPrompt(
        jobDescription,
        template,
        0,
        'balanced',
        false,
        undefined,
        'international',
        null,
        0,
      );
      expect(result).toContain('Write between 250 and 400 words.');
      expect(result).not.toContain('Word limit:');
      expect(result).not.toContain('Character limit:');
    });

    it('prefers the word limit over the character limit if both are somehow passed', () => {
      const result = buildCoverLetterPrompt(
        jobDescription,
        template,
        200,
        'balanced',
        false,
        undefined,
        'international',
        null,
        2000,
      );
      expect(result).toContain('Word limit: 200 words maximum');
      expect(result).not.toContain('Character limit:');
    });

    it('should handle missing template correctly', () => {
      const result = buildCoverLetterPrompt(jobDescription, '');
      expect(result).toContain(
        'The candidate did not provide a previous cover letter',
      );
    });

    it('treats a whitespace-only template as present rather than missing', () => {
      const result = buildCoverLetterPrompt(jobDescription, '   ');
      expect(result).toContain('Candidate Background / Existing Cover Letter:');
      expect(result).not.toContain(
        'The candidate did not provide a previous cover letter',
      );
    });

    describe('language mode', () => {
      it('defaults to professional English when sameLanguage is not set', () => {
        const result = buildCoverLetterPrompt(jobDescription, template);
        expect(result).toContain('Write in professional English');
        expect(result).not.toContain('CRITICAL: The cover letter MUST be written in the SAME LANGUAGE');
      });

      it('instructs the model to match the job description language when sameLanguage is true', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'balanced',
          true,
        );
        expect(result).toContain(
          'CRITICAL: The cover letter MUST be written in the SAME LANGUAGE as the job description below',
        );
        expect(result).not.toContain('Write in professional English unless instructed otherwise.');
      });
    });

    describe('job market selection', () => {
      it('includes Sweden-specific guidelines when jobMarket is sweden', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'balanced',
          false,
          undefined,
          'sweden',
        );
        expect(result).toContain('Job Market: Sweden');
        expect(result).toContain('Be humble, genuine and professional.');
      });

      it('includes Bangladesh-specific guidelines when jobMarket is bangladesh', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'balanced',
          false,
          undefined,
          'bangladesh',
        );
        expect(result).toContain('Job Market: Bangladesh');
        expect(result).toContain('Be respectful and formal.');
      });
    });

    it('appends the custom prompt to the end of the full built prompt', () => {
      const result = buildCoverLetterPrompt(
        jobDescription,
        template,
        null,
        'balanced',
        false,
        'Mention my open-source work',
      );
      const customIndex = result.indexOf('Additional user instruction:');
      expect(customIndex).toBeGreaterThan(-1);
      expect(result.indexOf('Mention my open-source work')).toBeGreaterThan(
        customIndex,
      );
      expect(customIndex).toBeGreaterThan(result.indexOf('Output Rules:'));
    });

    it('should sanitize malicious code in job description and template', () => {
      const maliciousJD = 'Software Engineer <img src=x onerror=alert(1)>';
      const maliciousTemplate =
        'Template <iframe src="javascript:alert(1)"></iframe>';
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
      expect(result).toContain('!@#$%^&*()_+{}|:');
    });

    describe('writing styles', () => {
      it('uses balanced style by default', () => {
        const result = buildCoverLetterPrompt(jobDescription, template);
        expect(result).toContain('Do not fabricate or invent anything new');
        expect(result).not.toContain('Make ONLY these changes');
        expect(result).not.toContain('Rewrite the cover letter as you like');
      });

      it('minimal style restricts changes to company, position, and skills', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'minimal',
        );
        expect(result).toContain('Make ONLY these changes');
        expect(result).toContain('Replace company name');
        expect(result).toContain('Replace position title');
        expect(result).toContain('do not invent new skills');
        expect(result).not.toContain('Rewrite the cover letter');
      });

      it('balanced style forbids fabrication and enforces human voice rules', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'balanced',
        );
        expect(result).toContain('Do not fabricate or invent anything new');
        expect(result).toContain('Avoid using dash');
        expect(result).toContain('Bread, Butter and Butterfly');
        expect(result).toContain('Use human voice');
      });

      it('full style allows invention and free rewriting', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'full',
        );
        expect(result).toContain('Rewrite the cover letter as you like');
        expect(result).toContain('You may invent new skills');
        expect(result).not.toContain('Make ONLY these changes');
        expect(result).not.toContain('Do not fabricate');
      });
    });

    describe('resume personalization', () => {
      const resumeText = 'Built scalable systems at Acme Corp for 5 years.';

      it('creates from scratch when neither template nor resume is provided', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          '',
          null,
          'balanced',
          false,
          undefined,
          'international',
          null,
        );
        expect(result).toContain(
          'The candidate did not provide a previous cover letter. Create one from scratch.',
        );
        expect(result).not.toContain('Candidate Resume:');
      });

      it('keeps existing template-only behavior when no resume is selected', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'balanced',
          false,
          undefined,
          'international',
          null,
        );
        expect(result).toContain(
          'Candidate Background / Existing Cover Letter:',
        );
        expect(result).toContain(template);
        expect(result).not.toContain('Candidate Resume:');
      });

      it('uses the resume as the background source when only a resume is selected', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          '',
          null,
          'balanced',
          false,
          undefined,
          'international',
          resumeText,
        );
        expect(result).toContain('Candidate Resume:');
        expect(result).toContain(resumeText);
        expect(result).toContain('personalized cover letter from scratch');
        expect(result).not.toContain(
          'The candidate did not provide a previous cover letter. Create one from scratch.',
        );
      });

      it('includes both the template and the resume, with a precedence note, when both are selected', () => {
        const result = buildCoverLetterPrompt(
          jobDescription,
          template,
          null,
          'balanced',
          false,
          undefined,
          'international',
          resumeText,
        );
        expect(result).toContain(
          'Candidate Background / Existing Cover Letter:',
        );
        expect(result).toContain(template);
        expect(result).toContain('Candidate Resume:');
        expect(result).toContain(resumeText);
        expect(result).toContain('do not contradict');
      });

      it('sanitizes malicious content in the resume text', () => {
        const maliciousResume = 'Skilled engineer <script>alert(1)</script>';
        const result = buildCoverLetterPrompt(
          jobDescription,
          '',
          null,
          'balanced',
          false,
          undefined,
          'international',
          maliciousResume,
        );
        expect(result).not.toContain('<script>');
        expect(result).toContain('Skilled engineer');
      });
    });
  });
});
