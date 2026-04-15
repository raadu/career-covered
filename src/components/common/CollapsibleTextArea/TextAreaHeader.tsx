import { type MouseEvent } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LuCopy, LuEraser } from "react-icons/lu";

interface TextAreaHeaderProps {
  label: string;
  value: string;
  required?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  handleCopy: (e: MouseEvent) => void;
  onClear?: () => void;
}

const TextAreaHeader = ({
  label,
  value,
  required,
  isExpanded,
  onToggleExpand,
  handleCopy,
  onClear,
}: TextAreaHeaderProps) => {
  return (
    <div
      className="py-2.5 px-4 flex items-center justify-between cursor-pointer bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 hover:bg-gray-100/50 transition-all duration-200 group"
      onClick={onToggleExpand}
    >
      <label className="font-semibold text-gray-700 flex items-center gap-2 cursor-pointer select-none text-sm tracking-tight">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {value && (
          <div className="flex items-center gap-1.5 mr-1">
            <button
              className="flex items-center gap-1.5 text-[10px] bg-white text-gray-600 py-1 px-2.5 rounded-md border border-gray-200 uppercase font-bold tracking-wider transition-all duration-200 hover:bg-white hover:border-blue-300 hover:text-blue-600 shadow-sm active:scale-95 group/btn"
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
                className="flex items-center gap-1.5 text-[10px] bg-gray-900 text-white py-1 px-2.5 rounded-md uppercase font-bold tracking-wider transition-all duration-200 border border-gray-900 hover:bg-gray-700 hover:border-gray-700 hover:shadow-md active:scale-95 group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                <LuEraser size={12} />
                Clear
              </button>
            )}
          </div>
        )}
        <button className="text-gray-400 group-hover:text-blue-500 transition-colors p-1" aria-label={isExpanded ? "Collapse" : "Expand"}>
          {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </button>
      </div>
    </div>
  );
};

export default TextAreaHeader;
