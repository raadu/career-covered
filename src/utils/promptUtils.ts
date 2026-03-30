export const buildCoverLetterPrompt = (jobDescription: string, template: string): string => {
    return `
You are an expert career consultant.
Task: Write a professional cover letter.
Context:
- Job Description:
${jobDescription}

${template ? `- User's Background/Style (Adapt this): \n${template}` : '- User has not provided a template. Use standard professional format.'}

Rules:
1. Keep it concise (under 400 words).
2. Only change Position Name, Company name, related skills.
3. If you see "[One line about product or company value that matches with me]", replace it with a line about product or company value that matches with the job description.
4. Leave the rest of the template as it is.
4. Output strictly the cover letter text. No preamble.
        `;
};
