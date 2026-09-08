import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FaEye,
  FaDownload,
  FaSyncAlt,
  FaTrash,
  FaGripVertical,
} from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';
import InlineEditableText from 'components/common/InlineEditableText';
import TableActions, { type TableAction } from 'components/common/TableActions';
import Checkbox from 'views/TemplatesView/Checkbox';
import formatDate from 'utils/dateUtils';
import { formatFileSize } from 'utils/fileSizeUtils';
import { useHiddenFileInput } from 'hooks/useHiddenFileInput';
import type { Resume } from './types';

interface ResumeTableRowProps {
  resume: Resume;
  isBusy: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRename: (name: string) => void;
  onPreview: () => void;
  onDownload: () => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
}

const ResumeTableRow = ({
  resume,
  isBusy,
  isSelected,
  onToggleSelect,
  onRename,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
}: ResumeTableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resume.id });
  const { inputRef, openPicker, handleChange } = useHiddenFileInput(onReplace);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: <FaEye size={12} />,
      onClick: onPreview,
    },
    {
      key: 'download',
      label: 'Download',
      icon: <FaDownload size={12} />,
      onClick: onDownload,
    },
    {
      key: 'replace',
      label: 'Replace',
      icon: <FaSyncAlt size={12} />,
      onClick: openPicker,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <FaTrash size={12} />,
      onClick: onDelete,
      variant: 'danger',
      dividerBefore: true,
    },
  ];

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isDragging ? 'shadow-lg z-10 opacity-90 relative' : ''
      } ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        <Checkbox
          checked={isSelected}
          onChange={onToggleSelect}
          id={`select-resume-${resume.id}`}
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        <InlineEditableText
          value={resume.name}
          onCommit={onRename}
          maxLength={200}
          className="block w-full truncate text-left font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          inputClassName="block w-full text-sm font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-600 rounded-sm px-1 -mx-1 outline-none"
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatFileSize(resume.fileSize)}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {formatDate(resume.createdAt)}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {formatDate(resume.updatedAt)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {isBusy ? (
          <LuLoader className="animate-spin text-cyan-500" size={16} />
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
              title="Drag to reorder"
            >
              <FaGripVertical size={14} />
            </button>
            <TableActions actions={actions} mode="menu" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
      </td>
    </tr>
  );
};

export default ResumeTableRow;
