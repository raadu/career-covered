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
      className="w-full sm:w-auto h-9 px-3 text-[11px] font-semibold rounded-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 shadow-sm transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
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
