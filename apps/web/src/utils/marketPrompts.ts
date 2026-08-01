export type JobMarket = 'international' | 'sweden' | 'bangladesh';

type MarketRules = Record<JobMarket, { label: string; guidelines: string }>;

const MARKET_RULES: MarketRules = {
  international: {
    label: 'International (US, Remote and most global companies)',
    guidelines: [
      'Focus on value and measurable achievements.',
      'Demonstrate understanding of the company or product.',
      'Explain why you are interested in this specific position.',
      'Connect previous experience directly to the job requirements.',
      'Use confident but natural language.',
      'Avoid clichés like "I am writing to express my interest..."',
      'Avoid repeating the resume.',
      'End with a confident call for further discussion.',
    ].join('\n'),
  },
  sweden: {
    label: 'Sweden',
    guidelines: [
      'Be humble, genuine and professional.',
      'Avoid exaggeration or overly sales-oriented language.',
      'Show collaboration, responsibility and willingness to learn.',
      "Demonstrate interest in the company's mission, products or values.",
      'Mention why you want to work specifically for this company.',
      'Show how your experience can contribute to the team.',
      'Keep the tone confident but modest.',
      'Avoid generic buzzwords and clichés.',
      'Focus on practical achievements and teamwork.',
      'End politely with appreciation and interest in an interview.',
    ].join('\n'),
  },
  bangladesh: {
    label: 'Bangladesh',
    guidelines: [
      'Be respectful and formal.',
      'Show enthusiasm for the position.',
      'Explain why your experience matches the role.',
      'Mention measurable achievements whenever possible.',
      'Show willingness to contribute to the organization.',
      'Keep the tone professional without unnecessary flattery.',
      'End respectfully and express availability for an interview.',
    ].join('\n'),
  },
};

export const getMarketRules = (jobMarket: JobMarket): string => {
  const market = MARKET_RULES[jobMarket];
  return `Job Market: ${market.label}

Write a cover letter suitable for the ${market.label} hiring culture.

${market.label} Cover Letter Guidelines:
${market.guidelines}`;
};
