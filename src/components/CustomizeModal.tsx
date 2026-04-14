import { useState, useEffect, ChangeEvent } from 'react';
import { FaTimes, FaSlidersH } from 'react-icons/fa';

export interface CustomizationOptions {
  limitWords: boolean;
  wordCount: number;
  minimalChanges: boolean;
}

export interface CustomizeModalSavePayload {
  options: CustomizationOptions;
  customPrompt: string;
}

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOptions: CustomizationOptions;
  onSave: (payload: CustomizeModalSavePayload) => void;
  hasTemplate: boolean;
}

const CustomizeModal = ({ isOpen, onClose, initialOptions, onSave, hasTemplate }: CustomizeModalProps) => {
  const [limitWords, setLimitWords] = useState<boolean>(initialOptions.limitWords);
  const [wordCountStr, setWordCountStr] = useState<string>(String(initialOptions.wordCount));
  const [minimalChanges, setMinimalChanges] = useState<boolean>(initialOptions.minimalChanges);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setLimitWords(initialOptions.limitWords);
      setWordCountStr(String(initialOptions.wordCount));
      setMinimalChanges(initialOptions.minimalChanges);
      setCustomPrompt('');
    }
  }, [isOpen, initialOptions]);

  const handleWordCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const val = e.target.value.replace(/\D/g, '');
    setWordCountStr(val);
    if (error) setError('');
  };

  const handleSave = () => {
    const trimmedCustomPrompt = customPrompt.trim();

    if (limitWords) {
      const finalWordCount = parseInt(wordCountStr, 10);
      if (isNaN(finalWordCount) || finalWordCount < 50 || finalWordCount > 1000) {
        setError("Numbers should be between 50 - 1000");
        return;
      }
      setWordCountStr(String(finalWordCount));
      onSave({
        options: {
          limitWords,
          wordCount: finalWordCount,
          minimalChanges
        },
        customPrompt: trimmedCustomPrompt
      });
    } else {
      setError('');
      onSave({
        options: {
          limitWords,
          wordCount: parseInt(wordCountStr, 10) || 400,
          minimalChanges
        },
        customPrompt: trimmedCustomPrompt
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-100 text-cyan-600 p-1.5 rounded-lg">
              <FaSlidersH size={14} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Cover Letter Customization
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 space-y-6">
          
          {/* Word Limit Setting */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-cyan-500/30 checked:bg-cyan-500 checked:border-cyan-500 transition-colors"
                  checked={limitWords}
                  onChange={(e) => setLimitWords(e.target.checked)}
                />
                <FaTimes className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform peer-checked:rotate-45 transition-all scale-75" />
                {/* We use FaTimes rotated as a quick checkmark alternative, but wait, let's use a standard svg or just CSS for checkmark. Actually just default checkbox is better or a pure SVG. */}
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Limit words
              </span>
            </label>

            {limitWords && (
              <div className="pl-8 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={wordCountStr}
                    onChange={handleWordCountChange}
                    placeholder="Numbers should be between 50 - 1000"
                    className={`flex-1 p-1.5 text-sm border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-cyan-500'} focus:border-transparent outline-none transition-all`}
                  />
                  <span className="text-sm text-gray-500">words</span>
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>
            )}
          </div>

          {hasTemplate && (
            <>
              <hr className="border-gray-100" />

              {/* Minimal Changes Setting */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    Minimal Changes to template
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    Only replace placeholders and minor tweaks.
                  </span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={minimalChanges}
                    onChange={() => setMinimalChanges(!minimalChanges)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  <span className="ml-3 text-xs font-semibold text-gray-500 w-8">
                    {minimalChanges ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>
            </>
          )}

          <hr className="border-gray-100" />

          <div className="space-y-2">
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
              Custom Prompt
            </label>
            <textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Wanna add or remove anything from your cover letter? Type here in your own words."
              className="min-h-28 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
          >
            Save Options
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeModal;
