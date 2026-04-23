import { sanitize } from './sanitizeUtils';

export const formatCustomPrompt = (customPrompt?: string): string => {
    const sanitizedPrompt = sanitize(customPrompt).trim();

    if (!sanitizedPrompt) {
        return '';
    }

    return `\nAdditional user instruction: ${sanitizedPrompt}`;
};

export const buildCoverLetterPrompt = (
    jobDescription: string,
    template: string,
    wordCountLimit: number | null = null,
    minimalChanges: boolean = true,
    customPrompt?: string
): string => {
    const sanitizedJD = sanitize(jobDescription);
    const sanitizedTemplate = sanitize(template);
    
    const wordRule = wordCountLimit 
        ? `1. Write the cover letter in ${wordCountLimit} words. Strictly under this limit.` 
        : `1. Keep it concise (under 400 words).`;

    const changesRule = minimalChanges
        ? `2. Only change Position Name, Company name and related skills.`
        : `2. You can use professional tone to change the related skills and motivation.`;

    return `
You are an expert career consultant.
Task: Write a professional cover letter.
Context:
- Job Description:
${sanitizedJD}

${sanitizedTemplate ? `- User's Background/Style (Adapt this): \n${sanitizedTemplate}` : '- User has not provided a template. Use standard professional format.'}

Rules:
${wordRule}
${changesRule}
3. If you see "[One line about product or company value that matches with me]", replace it with a line about product or company value that matches with the job description.
4. Leave the rest of the template as it is.
5. Output strictly the cover letter text. No preamble.${formatCustomPrompt(customPrompt)}
        `;
};
