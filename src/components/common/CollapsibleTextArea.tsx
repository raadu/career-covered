import React from 'react';
import { FaChevronDown, FaChevronUp, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CollapsibleTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  placeholder?: string;
  required?: boolean;
  onClear?: () => void;
}

const CollapsibleTextArea: React.FC<CollapsibleTextAreaProps> = ({
  label,
  value,
  onChange,
  isExpanded,
  onToggleExpand,
  placeholder,
  required,
  onClear
}) => {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) {
        toast.error("Nothing to copy!");
        return;
    }
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`, {
        icon: '📋',
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '12px'
        },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
      <div 
        className="py-2 px-4 flex items-center justify-between cursor-pointer bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <label className="font-semibold text-gray-700 flex items-center gap-2 cursor-pointer select-none">
          {label}
          {required && <span className="text-red-500 text-sm">*</span>}
        </label>
        <div className="flex items-center gap-3">
          {value && (
            <button 
              className="group flex items-center gap-1.5 text-[10px] bg-white text-gray-600 py-0.5 px-2 rounded border border-gray-200 uppercase font-bold tracking-wider transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:text-black shadow-sm active:scale-95"
              onClick={handleCopy}
              title={`Copy ${label}`}
            >
              <FaCopy size={10} className="group-hover:text-blue-500 transition-colors" />
              Copy
            </button>
          )}
          {onClear && value && (
            <button 
              className="text-[10px] bg-black text-white py-0.5 px-2 rounded uppercase font-bold tracking-wider transition-all duration-200 border border-black hover:bg-gray-600 hover:border-gray-700 hover:shadow-sm active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              Clear
            </button>
          )}
          <button className="text-gray-500 hover:text-blue-600 transition-colors">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out relative ${isExpanded ? 'h-auto' : 'h-20'}`}>
        <textarea
          className={`w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none text-gray-700 text-sm leading-relaxed h-full block ${!isExpanded ? 'cursor-pointer' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={isExpanded ? 10 : 2}
          onClick={() => !isExpanded && onToggleExpand()}
        />
        {!isExpanded && (
            <div 
                className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" 
            />
        )}
      </div>
    </div>
  );
};

export default CollapsibleTextArea;
