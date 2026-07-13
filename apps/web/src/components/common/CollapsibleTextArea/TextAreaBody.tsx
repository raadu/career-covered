interface TextAreaBodyProps {
  value: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  placeholder?: string;
}

const TextAreaBody = ({
  value,
  onChange,
  isExpanded,
  onToggleExpand,
  placeholder,
}: TextAreaBodyProps) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out relative ${
        isExpanded ? "min-h-[160px] overflow-visible" : "h-16 overflow-hidden"
      }`}
    >
      <textarea
        className={`w-full p-3 md:p-4 focus:outline-none focus:ring-0 focus:bg-blue-50/10 dark:focus:bg-blue-900/10 resize-none text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed h-full block transition-colors bg-transparent ${
          !isExpanded ? "cursor-pointer" : ""
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={isExpanded ? 7 : 2}
        onClick={() => !isExpanded && onToggleExpand()}
      />
      {!isExpanded && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent pointer-events-none transition-opacity duration-300" 
          onClick={onToggleExpand}
        />
      )}
    </div>
  );
};

export default TextAreaBody;
