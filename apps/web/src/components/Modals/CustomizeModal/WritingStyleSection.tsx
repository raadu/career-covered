export type WritingStyle = 'minimal' | 'balanced' | 'full';

interface WritingStyleOption {
  value: WritingStyle;
  label: string;
  description: string;
}

const WRITING_STYLES: WritingStyleOption[] = [
  {
    value: 'minimal',
    label: 'Minimal',
    description:
      'Keep my cover letter almost the same. Just change some information based on the job description.',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description:
      'No fabricated experience. Personalize it while keeping my voice.',
  },
  {
    value: 'full',
    label: 'Full',
    description: 'Rewrite it more freely for this specific job.',
  },
];

interface WritingStyleSectionProps {
  writingStyle: WritingStyle;
  onChange: (style: WritingStyle) => void;
  hasTemplate: boolean;
}

const WritingStyleSection = ({
  writingStyle,
  onChange,
  hasTemplate,
}: WritingStyleSectionProps) => {
  return (
    <>
      <hr className="border-neutral-200 dark:border-neutral-700" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
          Writing Style
        </span>
        <div className="space-y-1.5">
          {WRITING_STYLES.map((option) => {
            const isDisabled = option.value === 'minimal' && !hasTemplate;
            return (
              <label
                key={option.value}
                className={`flex items-start gap-2 p-2 border transition-colors ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed border-neutral-200 dark:border-neutral-700'
                    : writingStyle === option.value
                      ? 'border-brand-400 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/20 cursor-pointer'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name="writingStyle"
                  value={option.value}
                  checked={writingStyle === option.value}
                  disabled={isDisabled}
                  onChange={() => onChange(option.value)}
                  className="mt-0.5 accent-brand-600"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {option.label}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {isDisabled
                      ? 'Please add cover letter template to enable it.'
                      : option.description}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default WritingStyleSection;
