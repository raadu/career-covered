import { useState, useRef, useEffect, useCallback } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { type SavedTemplate } from 'store/coverLetterSlice';
import TemplateBox from './TemplateBox';

interface TemplateSelectorProps {
  templates: SavedTemplate[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

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
