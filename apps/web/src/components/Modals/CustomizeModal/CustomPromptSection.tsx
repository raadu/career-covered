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
      <hr className="border-gray-100 dark:border-gray-700" />
      <div className="space-y-2">
        <label
          htmlFor="custom-prompt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Custom Prompt
        </label>
        <textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Wanna add or remove anything from your cover letter? Type here in your own words."
          className="min-h-20 w-full border border-gray-300 dark:border-gray-600 p-2 text-sm text-gray-700 dark:text-gray-300 outline-none transition-all placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 bg-transparent"
        />
      </div>
    </>
  );
};

export default CustomPromptSection;
