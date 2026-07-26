import { useState, useRef, useEffect, useCallback } from 'react';
import { LuPencil, LuX, LuCheck, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { type SavedTemplate } from 'store/coverLetterSlice';

interface TemplateSelectorProps {
  templates: SavedTemplate[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const TemplateBox = ({
  template,
  isActive,
  onSelect,
  onRename,
  onRemove,
}: {
  template: SavedTemplate;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
}) => {
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
      className={`group relative flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl cursor-pointer transition-all duration-200 border text-xs sm:text-sm min-w-[160px] max-w-[280px] shrink-0 ${
        isActive
          ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 shadow-sm'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm'
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
          className="flex-1 min-w-0 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-200 border-b-2 border-blue-400 outline-none py-0.5"
        />
      ) : (
        <span className="flex-1 min-w-0 truncate text-sm font-bold text-gray-800 dark:text-gray-200">
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
            className="p-0.5 text-green-500 hover:text-green-600 transition-colors"
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
            className="p-0.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
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
          className="p-0.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
          title="Delete Template"
        >
          <LuX size={12} />
        </button>
      </div>
    </div>
  );
};

const SCROLL_AMOUNT = 300;

const TemplateSelector = ({
  templates,
  activeId,
  onSelect,
  onRename,
  onRemove,
}: TemplateSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [templates, updateScrollState]);

  const scrollBy = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  if (templates.length === 0) return null;

  return (
    <div className="relative mb-2">
      {canScrollLeft && (
        <button
          onClick={() => scrollBy('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <LuChevronLeft size={14} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollBy('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <LuChevronRight size={14} />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {templates.map((tpl) => (
          <TemplateBox
            key={tpl.id}
            template={tpl}
            isActive={tpl.id === activeId}
            onSelect={() => onSelect(tpl.id)}
            onRename={(name) => onRename(tpl.id, name)}
            onRemove={() => onRemove(tpl.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
