import { type MouseEvent } from 'react';
import {
  LuChevronDown,
  LuChevronUp,
  LuCopy,
  LuEraser,
  LuPlus,
} from 'react-icons/lu';

interface TextAreaHeaderProps {
  label: string;
  value: string;
  required?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  handleCopy: (e: MouseEvent) => void;
  onClear?: () => void;
  onAddTemplate?: () => void;
}

const TextAreaHeader = ({
  label,
  value,
  required,
  isExpanded,
  onToggleExpand,
  handleCopy,
  onClear,
  onAddTemplate,
}: TextAreaHeaderProps) => {
  const chevron = (
    <button
      className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors p-1"
      aria-label={isExpanded ? 'Collapse' : 'Expand'}
    >
      {isExpanded ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
    </button>
  );

  return (
    <div
      className="py-1.5 px-2 md:py-2 md:px-3 cursor-pointer bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200 group"
      onClick={onToggleExpand}
    >
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 cursor-pointer select-none text-sm tracking-tight">
            {label}
            {required && <span className="text-red-500 text-xs">*</span>}
          </label>
          <div className="sm:hidden">{chevron}</div>
        </div>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          {value && (
            <>
              {onAddTemplate && (
                <button
                  className={`flex items-center gap-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2.5 border border-gray-200 dark:border-gray-600 uppercase font-bold tracking-wider transition-all duration-200 hover:bg-white dark:hover:bg-gray-600 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm active:scale-95 group/btn ${
                    !value.trim() ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (value.trim() && onAddTemplate) onAddTemplate();
                  }}
                  title="Save as a template"
                  disabled={!value.trim()}
                >
                  <LuPlus
                    size={12}
                    className="group-hover/btn:scale-110 transition-transform"
                  />
                  Save as Template
                </button>
              )}
              <button
                className="flex items-center gap-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2.5 border border-gray-200 dark:border-gray-600 uppercase font-bold tracking-wider transition-all duration-200 hover:bg-white dark:hover:bg-gray-600 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm active:scale-95 group/btn"
                onClick={handleCopy}
                title={`Copy ${label}`}
              >
                <LuCopy
                  size={12}
                  className="group-hover/btn:scale-110 transition-transform"
                />
                Copy
              </button>
              {onClear && (
                <button
                  className="flex items-center gap-1.5 text-[10px] bg-gray-900 dark:bg-gray-600 text-white py-1 px-2.5 uppercase font-bold tracking-wider transition-all duration-200 border border-gray-900 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 hover:border-gray-700 hover:shadow-md active:scale-95 group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  title={`Remove all the text`}
                >
                  <LuEraser size={12} />
                  Clear
                </button>
              )}
            </>
          )}
          <div className="hidden sm:block">{chevron}</div>
        </div>
      </div>
    </div>
  );
};

export default TextAreaHeader;
