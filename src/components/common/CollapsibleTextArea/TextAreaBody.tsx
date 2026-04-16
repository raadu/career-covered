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
        isExpanded ? "min-h-[250px] overflow-visible" : "h-24 overflow-hidden"
      }`}
    >
      <textarea
        className={`w-full p-4 focus:outline-none focus:ring-0 focus:bg-blue-50/10 resize-none text-gray-700 text-sm leading-relaxed h-full block transition-colors ${
          !isExpanded ? "cursor-pointer" : ""
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={isExpanded ? 12 : 3}
        onClick={() => !isExpanded && onToggleExpand()}
      />
      {!isExpanded && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none transition-opacity duration-300" 
          onClick={onToggleExpand}
        />
      )}
    </div>
  );
};

export default TextAreaBody;
