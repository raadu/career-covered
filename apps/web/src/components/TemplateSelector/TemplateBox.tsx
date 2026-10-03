import { useState, useRef, useEffect } from 'react';
import { LuPencil, LuX, LuCheck } from 'react-icons/lu';
import { clsx } from 'clsx';
import { type SavedTemplate } from 'store/coverLetterSlice';

const iconButtonBase =
  'min-h-10 [@media(pointer:fine)]:min-h-8 min-w-6 flex items-center justify-center transition-colors';

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
      // Active: the same solid brand-800 fill and border as a selected resume
      // row, with white text and light icons so they stay readable on it.
      className={clsx(
        'group relative flex items-center gap-1 sm:gap-1.5 px-1 sm:px-1.5 cursor-pointer transition-all duration-200 border text-xs sm:text-sm min-w-[160px] max-w-[280px] shrink-0',
        isActive
          ? 'bg-brand-800 border-brand-800 shadow-sm'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm',
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            'flex-1 min-w-0 bg-transparent text-sm font-bold border-b-2 outline-none py-0.5',
            isActive
              ? 'text-white border-brand-300'
              : 'text-neutral-800 dark:text-neutral-200 border-brand-400',
          )}
        />
      ) : (
        <span
          className={clsx(
            'flex-1 min-w-0 truncate text-sm font-bold',
            isActive ? 'text-white' : 'text-neutral-800 dark:text-neutral-200',
          )}
        >
          {template.name}
        </span>
      )}

      {/* Always visible (touch has no hover to reveal them), grouped at the
          chip's right edge — the name's flex-1 pushes them there. 24px-wide
          buttons keep the two icons close together; on mouse devices they're
          32px tall so the chip (with its border) matches the 34px buttons. */}
      <div className="flex items-center gap-0 shrink-0 ml-auto">
        {editing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              commitRename();
            }}
            className={clsx(
              iconButtonBase,
              isActive
                ? 'text-success-fg-dark hover:text-white'
                : 'text-success hover:text-success-hover',
            )}
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
            className={clsx(
              iconButtonBase,
              isActive
                ? 'text-brand-100 hover:text-white'
                : 'text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400',
            )}
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
          className={clsx(
            iconButtonBase,
            isActive
              ? 'text-brand-100 hover:text-danger-fg-dark'
              : 'text-neutral-400 hover:text-danger dark:hover:text-danger-fg-dark',
          )}
          title="Delete Template"
        >
          <LuX size={12} />
        </button>
      </div>
    </div>
  );
};

export default TemplateBox;
