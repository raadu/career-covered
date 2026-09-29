interface CustomPromptSectionProps {
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
}

const CustomPromptSection = ({
  customPrompt,
  setCustomPrompt,
}: CustomPromptSectionProps) => {
  return (
    <>
      <hr className="border-neutral-200 dark:border-neutral-700" />
      <div className="space-y-2">
        <label
          htmlFor="custom-prompt"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          Custom Prompt
        </label>
        <textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Wanna add or remove anything from your cover letter? Type here in your own words."
          className="min-h-20 w-full border border-neutral-300 dark:border-neutral-600 p-2 text-sm text-neutral-700 dark:text-neutral-300 outline-none transition-all placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-transparent"
        />
      </div>
    </>
  );
};

export default CustomPromptSection;
