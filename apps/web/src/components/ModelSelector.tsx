import { FaRobot } from 'react-icons/fa';
import { AVAILABLE_MODELS } from 'utils/modelsInfoUtils';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 text-xs w-full md:w-auto h-9">
      <div className="text-gray-400 dark:text-gray-500 pl-1">
        <FaRobot />
      </div>
      <div className="flex-1">
          <label 
            htmlFor="model-select"
            className="text-[10px] text-gray-500 dark:text-gray-400 block leading-tight"
          >
            AI Model
          </label>
          <select 
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent font-medium text-gray-700 dark:text-gray-300 outline-none w-full cursor-pointer text-xs"
          >
            {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                    {model.name}
                </option>
            ))}
          </select>
      </div>
    </div>
  );
};

export default ModelSelector;
