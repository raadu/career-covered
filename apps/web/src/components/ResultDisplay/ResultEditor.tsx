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
        className="w-full min-h-[400px] border-0 focus:ring-0 p-2 text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap font-serif text-lg leading-relaxed bg-transparent transition-all outline-none resize-none"
        spellCheck="false"
        placeholder="Your generated cover letter will appear here..."
      />
    </div>
  );
};

export default ResultEditor;
