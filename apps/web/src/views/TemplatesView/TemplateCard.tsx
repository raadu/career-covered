import { FaFileAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { ICON_SIZE } from 'components/common/iconSizes';
import { tableActionButtonClass } from 'components/common/DataTable/tableColumnMeta';
import formatDate from 'utils/dateUtils';
import type { Template } from './types';

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCard = ({ template, onEdit, onDelete }: TemplateCardProps) => (
  <div className="flex flex-col border border-neutral-200 dark:border-neutral-700 p-2.5 sm:p-3 bg-white dark:bg-neutral-900">
    <div className="flex items-start justify-between mb-2">
      <div className="h-10 w-10 flex items-center justify-center bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 shrink-0">
        <FaFileAlt size={18} />
      </div>
    </div>

    <button
      type="button"
      onClick={onEdit}
      title="Click to edit"
      className="text-left text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
    >
      {template.name}
    </button>
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
      {template.content}
    </p>
    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
      Updated {formatDate(template.updatedAt)}
    </p>

    <div className="mt-auto pt-2.5 flex items-center gap-1 border-t border-neutral-100 dark:border-neutral-800">
      <button
        type="button"
        onClick={onEdit}
        title="Edit Template"
        className={tableActionButtonClass}
      >
        <FaPencilAlt size={ICON_SIZE.xs} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete Template"
        className={`ml-auto ${tableActionButtonClass}`}
      >
        <FaTrash size={ICON_SIZE.xs} />
      </button>
    </div>
  </div>
);

export default TemplateCard;
