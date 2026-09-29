interface SameLanguageSectionProps {
  sameLanguage: boolean;
  onToggle: () => void;
}

const SameLanguageSection = ({
  sameLanguage,
  onToggle,
}: SameLanguageSectionProps) => {
  return (
    <>
      <hr className="border-neutral-200 dark:border-neutral-700" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Same Language
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-[200px] sm:max-w-[250px]">
            Create the cover letter in the same language of the job description.
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={sameLanguage}
            onChange={onToggle}
          />
          <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
          <span className="ml-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 w-8">
            {sameLanguage ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>
    </>
  );
};

export default SameLanguageSection;
