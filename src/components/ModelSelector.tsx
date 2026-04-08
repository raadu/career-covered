import React from 'react';
import { FaRobot } from 'react-icons/fa';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (High Quality)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs w-full md:w-auto h-9">
      <div className="text-gray-400 pl-1">
        <FaRobot />
      </div>
      <div className="flex-1">
          <span className="text-[10px] text-gray-500 block leading-tight">AI Model</span>
          <select 
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent font-medium text-gray-700 outline-none w-full cursor-pointer text-xs"
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
