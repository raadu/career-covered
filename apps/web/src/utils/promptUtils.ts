import { sanitize } from './sanitizeUtils';
import { getMarketRules } from './marketPrompts';
export type { JobMarket } from './marketPrompts';

// ────────────────────────────────
// Section: System Role
// ────────────────────────────────
const SYSTEM_ROLE = `You are an expert career coach, recruiter and professional cover letter writer.

Your objective is to write a highly personalized, ATS-friendly cover letter that maximizes interview chances.`;

// ────────────────────────────────
// Section: Structure Rules
// ────────────────────────────────
const STRUCTURE_RULES = `Structure:
- Use 3 to 5 paragraphs.
- Prefer 3 paragraphs unless additional words naturally require 4 or 5.
- Each paragraph should have a clear purpose.

Opening Paragraph:
- Start naturally.
- Mention the position.
- Show genuine interest.
- Include one specific reason the company, mission, product or role interests the candidate.
- Avoid generic openings such as "I am writing to express my interest..."

Middle Paragraph(s):
- Demonstrate the strongest qualifications.
- Match experience directly with the job description.
- Include relevant technical skills.
- Mention measurable achievements whenever appropriate.
- Explain how previous work can benefit the employer.
- Do not simply repeat the resume.
- Keep every sentence relevant.

Closing Paragraph:
- Reaffirm interest.
- Briefly summarize why the candidate is a good fit.
- Politely express interest in discussing the opportunity.
- End professionally.
- Do not be overly formal or old-fashioned.`;

// ────────────────────────────────
// Section: ATS Optimization
// ────────────────────────────────
const ATS_RULES = `ATS Optimization:
- Naturally include important keywords from the job description.
- Mirror the terminology used by the employer where appropriate.
- Use simple formatting.
- Do not use tables.
- Do not use bullet points.
- Do not use emojis.
- Do not use special symbols.
- Avoid headers, footers and graphics.
- Use standard paragraph formatting only.
- Keep sentences concise and easy to read.`;

// ────────────────────────────────
// Section: Output Rules
// ────────────────────────────────
const OUTPUT_RULES = `Output Rules:
- Output ONLY the cover letter.
- Do not include explanations.
- Do not include markdown.
- Do not include notes.
- Do not include titles like "Cover Letter".
- Do not invent facts that cannot reasonably be inferred.
- Make the writing sound human, natural and personalized.`;

// ────────────────────────────────
// Section: Template Placeholder
// ────────────────────────────────
const TEMPLATE_PLACEHOLDER_RULES = `Template Placeholder:
If you find:
"[One line about product or company value that matches with me]"

Replace it with one customized sentence that reflects the company's product, mission, values or impact based on the job description.`;

// ────────────────────────────────
// Section: Format Helpers
// ────────────────────────────────

const buildWordRule = (wordCountLimit: number | null): string =>
  wordCountLimit
    ? `Word limit: ${wordCountLimit} words maximum. Count your words carefully. Do NOT exceed this limit.`
    : `Write between 250 and 400 words.`;

const buildChangesRule = (minimalChanges: boolean): string =>
  minimalChanges
    ? `CRITICAL: Make ONLY these changes to the provided template:
1. Replace company name with the new company.
2. Replace position title with the new position.
3. Update specific skills to match the job description (only if missing or outdated).
Keep ALL other sentences exactly as written. Do NOT rewrite, rephrase, restructure, or add new paragraphs. Preserve the original text word-for-word except for the three changes listed above.`
    : `You may rewrite motivation, skills and experience to create a stronger and more tailored cover letter while remaining truthful.`;

const buildLanguageRule = (sameLanguage: boolean): string =>
  sameLanguage
    ? `CRITICAL: The cover letter MUST be written in the SAME LANGUAGE as the job description below. Analyze the job description's language and write the entire cover letter in that language. Do NOT default to English.`
    : `Write in professional English unless instructed otherwise.`;

// Covers all four combinations of (template present?, resume present?) —
// the resume is the candidate's real background when there's no template
// to work from, and a supplementary source of facts/skills when there is.
const buildBackgroundSection = (
  template: string,
  resumeText: string | null,
): string => {
  if (template && resumeText) {
    return `Candidate Background / Existing Cover Letter:
${template}

Candidate Resume:
${resumeText}

The existing cover letter above should still drive the overall voice and structure. Use the resume only to add factual details, skills or achievements the cover letter doesn't already mention — do not contradict anything already stated in the cover letter.`;
  }

  if (resumeText) {
    return `Candidate Resume:
${resumeText}

The candidate did not provide a previous cover letter. Write a highly personalized cover letter from scratch, using the resume above to match the candidate's real skills and experience to the job description.`;
  }

  if (template) {
    return `Candidate Background / Existing Cover Letter:\n${template}`;
  }

  return `The candidate did not provide a previous cover letter. Create one from scratch.`;
};

// ────────────────────────────────
// Public Helpers
// ────────────────────────────────

export const formatCustomPrompt = (customPrompt?: string): string => {
  const sanitizedPrompt = sanitize(customPrompt).trim();

  if (!sanitizedPrompt) {
    return '';
  }

  return `

Additional user instruction:
${sanitizedPrompt}`;
};

// ────────────────────────────────
// Main Prompt Builder
// ────────────────────────────────

export const buildCoverLetterPrompt = (
  jobDescription: string,
  template: string,
  wordCountLimit: number | null = null,
  minimalChanges: boolean = true,
  sameLanguage: boolean = false,
  customPrompt?: string,
  jobMarket: import('./marketPrompts').JobMarket = 'international',
  resumeText?: string | null,
): string => {
  const sanitizedJD = sanitize(jobDescription);
  const sanitizedTemplate = sanitize(template);
  const sanitizedResumeText = resumeText ? sanitize(resumeText) : null;

  const wordRule = buildWordRule(wordCountLimit);
  const changesRule = buildChangesRule(minimalChanges);
  const languageRule = buildLanguageRule(sameLanguage);
  const marketRules = getMarketRules(jobMarket);

  const backgroundSection = buildBackgroundSection(
    sanitizedTemplate,
    sanitizedResumeText,
  );

  return [
    SYSTEM_ROLE,
    '',
    'Job Description:',
    sanitizedJD,
    '',
    backgroundSection,
    '',
    marketRules,
    '',
    'General Requirements',
    '',
    wordRule,
    '',
    'The cover letter must fit on one A4 page.',
    '',
    STRUCTURE_RULES,
    '',
    ATS_RULES,
    '',
    'Template Handling:',
    changesRule,
    '',
    TEMPLATE_PLACEHOLDER_RULES,
    '',
    OUTPUT_RULES,
    '',
    languageRule,
    formatCustomPrompt(customPrompt),
  ]
    .filter(Boolean)
    .join('\n');
};
