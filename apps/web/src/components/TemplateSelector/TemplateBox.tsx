import { useState, useRef, useEffect } from 'react';
import { LuPencil, LuX, LuCheck } from 'react-icons/lu';
import { type SavedTemplate } from 'store/coverLetterSlice';

interface TemplateBoxProps {
  template: SavedTemplate;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
}

const TemplateBox = ({
  template,
  isActive,
  onSelect,
  onRename,
  onRemove,
}: TemplateBoxProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(template.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== template.name) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') {
      setEditValue(template.name);
      setEditing(false);
    }
  };

  return (
    <div
      onClick={!editing ? onSelect : undefined}
      className={`group relative flex items-center gap-1 sm:gap-1.5 px-1 sm:px-1.5 cursor-pointer transition-all duration-200 border text-xs sm:text-sm min-w-[160px] max-w-[280px] shrink-0 ${
        isActive
          ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-600 shadow-sm'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm'
      }`}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-200 border-b-2 border-brand-400 outline-none py-0.5"
        />
      ) : (
        <span className="flex-1 min-w-0 truncate text-sm font-bold text-neutral-800 dark:text-neutral-200">
          {template.name}
        </span>
      )}

      <div className="flex items-center gap-0 shrink-0">
        {editing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              commitRename();
            }}
            className="min-h-10 min-w-10 flex items-center justify-center text-success hover:text-success-hover transition-colors"
          >
            <LuCheck size={14} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditValue(template.name);
              setEditing(true);
            }}
            className="min-h-10 min-w-10 flex items-center justify-center text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
            title="Rename Template"
          >
            <LuPencil size={12} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="min-h-10 min-w-10 flex items-center justify-center text-neutral-400 hover:text-danger dark:hover:text-danger-fg-dark sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
          title="Delete Template"
        >
          <LuX size={12} />
        </button>
      </div>
    </div>
  );
};

export default TemplateBox;
