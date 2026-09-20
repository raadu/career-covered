import { AVAILABLE_MODELS } from 'utils/AIModelUtils';

interface ModelSelectProps {
  selectedModel: string;
  onChange: (modelId: string) => void;
}

const ModelSelect = ({ selectedModel, onChange }: ModelSelectProps) => {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onChange(e.target.value)}
      aria-label="AI Model"
      className="w-full sm:w-auto h-10 px-3 text-[11px] font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 shadow-sm transition-all duration-200 hover:border-brand-200 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
    >
      {AVAILABLE_MODELS.map((model) => (
        <option key={model.id} value={model.id} title={model.description}>
          {model.label}
        </option>
      ))}
    </select>
  );
};

export default ModelSelect;
