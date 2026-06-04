import { useState, useRef, useEffect } from 'react';
import { LuPencil, LuX, LuCheck } from 'react-icons/lu';
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
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 border text-sm min-w-0 ${
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
            className="p-0.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
          className="p-0.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete Template"
        >
          <LuX size={12} />
        </button>
      </div>
    </div>
  );
};

const TemplateSelector = ({
  templates,
  activeId,
  onSelect,
  onRename,
  onRemove,
}: TemplateSelectorProps) => {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
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
  );
};

export default TemplateSelector;
