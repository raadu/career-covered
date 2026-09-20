import { type MouseEvent } from 'react';
import {
  LuChevronDown,
  LuChevronUp,
  LuCopy,
  LuEraser,
  LuPlus,
} from 'react-icons/lu';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';

interface TextAreaHeaderProps {
  label: string;
  value: string;
  required?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  handleCopy: (e: MouseEvent) => void;
  onClear?: () => void;
  onAddTemplate?: () => void;
}

const TextAreaHeader = ({
  label,
  value,
  required,
  isExpanded,
  onToggleExpand,
  handleCopy,
  onClear,
  onAddTemplate,
}: TextAreaHeaderProps) => {
  const chevron = (
    <button
      className="text-neutral-400 dark:text-neutral-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors p-1"
      aria-label={isExpanded ? 'Collapse' : 'Expand'}
    >
      {isExpanded ? (
        <LuChevronUp size={ICON_SIZE.xs} />
      ) : (
        <LuChevronDown size={ICON_SIZE.xs} />
      )}
    </button>
  );

  return (
    <div
      className="py-1.5 px-2 md:py-2 md:px-3 cursor-pointer bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50 transition-all duration-200 group"
      onClick={onToggleExpand}
    >
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 cursor-pointer select-none text-sm tracking-tight">
            {label}
            {required && (
              <span className="text-danger dark:text-danger-fg-dark text-xs">
                *
              </span>
            )}
          </label>
          <div className="sm:hidden">{chevron}</div>
        </div>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          {value && (
            <>
              {onAddTemplate && (
                <CommonButton
                  variant="outline"
                  icon={<LuPlus size={ICON_SIZE.xs} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (value.trim() && onAddTemplate) onAddTemplate();
                  }}
                  title="Save as a template"
                  disabled={!value.trim()}
                  className="px-2 text-xs"
                >
                  Save as Template
                </CommonButton>
              )}
              <CommonButton
                variant="ghost"
                icon={<LuCopy size={ICON_SIZE.xs} />}
                onClick={handleCopy}
                title={`Copy ${label}`}
                className="px-2 text-xs"
              >
                Copy
              </CommonButton>
              {onClear && (
                <CommonButton
                  variant="destructive"
                  icon={<LuEraser size={ICON_SIZE.xs} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  title="Remove all the text"
                  className="px-2 text-xs"
                >
                  Clear
                </CommonButton>
              )}
            </>
          )}
          <div className="hidden sm:block">{chevron}</div>
        </div>
      </div>
    </div>
  );
};

export default TextAreaHeader;
