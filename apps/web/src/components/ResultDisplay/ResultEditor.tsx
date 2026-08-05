import { useEffect, useRef } from 'react';

interface ResultEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const ResultEditor = ({ value, onChange }: ResultEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [value]);

  return (
    <div className="p-4 md:p-8">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[400px] border-0 focus:ring-0 rounded-lg p-2 text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-serif text-lg leading-relaxed bg-transparent transition-all outline-none resize-none"
        spellCheck="false"
        placeholder="Your generated cover letter will appear here..."
      />
      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 text-[11px] text-gray-400 dark:text-gray-500 italic">
        Tip: You can edit the text above to personalize it further.
      </div>
    </div>
  );
};

export default ResultEditor;
