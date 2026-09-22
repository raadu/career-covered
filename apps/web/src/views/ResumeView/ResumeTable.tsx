import { useMemo } from 'react';
import { type ColumnDef, type CellContext } from '@tanstack/react-table';
import { FaEye, FaDownload, FaSyncAlt, FaTrash } from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';
import DataTable from 'components/common/DataTable';
import DragHandle from 'components/common/DataTable/DragHandle';
import Checkbox from 'components/common/Checkbox';
import InlineEditableText from 'components/common/InlineEditableText';
import TableActions, {
  type TableAction,
} from 'components/common/TableActions';
import { ICON_SIZE } from 'components/common/iconSizes';
import { useHiddenFileInput } from 'hooks/useHiddenFileInput';
import formatDate from 'utils/dateUtils';
import { formatFileSize } from 'utils/fileSizeUtils';
import type { Resume } from './types';

interface ResumeTableProps {
  resumes: Resume[];
  busyId: string | null;
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onReorder: (newOrder: Resume[]) => void;
  onRename: (id: string, name: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

interface ActionsCellProps {
  resume: Resume;
  isBusy: boolean;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}

// A column's `cell` is a plain render function, not a component that could
// call useHiddenFileInput itself — this delegates to a real component so
// each row gets its own hidden file input.
const ActionsCell = ({
  resume,
  isBusy,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
}: ActionsCellProps) => {
  const { inputRef, openPicker, handleChange } = useHiddenFileInput((file) =>
    onReplace(resume.id, file),
  );

  if (isBusy) {
    return <LuLoader className="animate-spin text-brand-500" size={16} />;
  }

  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: <FaEye size={ICON_SIZE.xs} />,
      onClick: () => onPreview(resume.id),
    },
    {
      key: 'download',
      label: 'Download',
      icon: <FaDownload size={ICON_SIZE.xs} />,
      onClick: () => onDownload(resume.id),
    },
    {
      key: 'replace',
      label: 'Replace',
      icon: <FaSyncAlt size={ICON_SIZE.xs} />,
      onClick: openPicker,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <FaTrash size={ICON_SIZE.xs} />,
      onClick: () => onDelete(resume.id),
      variant: 'danger',
      dividerBefore: true,
    },
  ];

  return (
    <div className="flex items-center gap-1">
      <DragHandle />
      <TableActions actions={actions} mode="menu" />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

const ResumeTable = ({
  resumes,
  busyId,
  selectedIds,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleSelect,
  onReorder,
  onRename,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
  pageIndex,
  pageSize,
  pageCount,
  total,
  onPageChange,
  onPageSizeChange,
}: ResumeTableProps) => {
  const selectAllIndeterminate = someSelected && !allSelected;

  const columns: ColumnDef<Resume>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={selectAllIndeterminate}
            onChange={onToggleSelectAll}
            id="select-all-resumes"
          />
        ),
        cell: ({ row }: CellContext<Resume, unknown>) => (
          <Checkbox
            checked={selectedIds.has(row.original.id)}
            onChange={() => onToggleSelect(row.original.id)}
            id={`select-resume-${row.original.id}`}
          />
        ),
        enableSorting: false,
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }: CellContext<Resume, unknown>) => (
          <InlineEditableText
            value={row.original.name}
            onCommit={(name) => onRename(row.original.id, name)}
            maxLength={200}
            className="block w-full truncate text-left font-semibold text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            inputClassName="block w-full text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 border border-brand-300 dark:border-brand-600 px-1 -mx-1 outline-none"
          />
        ),
      },
      {
        header: 'Size',
        accessorKey: 'fileSize',
        meta: { hideBelow: 'lg' },
        cell: ({ getValue }: CellContext<Resume, unknown>) => (
          <span className="text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            {formatFileSize(getValue<number>())}
          </span>
        ),
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        meta: { hideBelow: 'md' },
        cell: ({ getValue }: CellContext<Resume, unknown>) => (
          <span className="text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        header: 'Last Updated',
        accessorKey: 'updatedAt',
        cell: ({ getValue }: CellContext<Resume, unknown>) => (
          <span className="text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        header: 'Action',
        id: 'actions',
        cell: ({ row }: CellContext<Resume, unknown>) => (
          <ActionsCell
            resume={row.original}
            isBusy={busyId === row.original.id}
            onPreview={onPreview}
            onDownload={onDownload}
            onReplace={onReplace}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [
      selectedIds,
      allSelected,
      selectAllIndeterminate,
      onToggleSelectAll,
      onToggleSelect,
      onRename,
      busyId,
      onPreview,
      onDownload,
      onReplace,
      onDelete,
    ],
  );

  return (
    <DataTable
      columns={columns}
      data={resumes}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      emptyMessage="No resumes yet. Upload one to get started."
      sortable
      getRowId={(resume) => resume.id}
      onReorder={onReorder}
      getRowClassName={(resume) =>
        busyId === resume.id ? 'opacity-60 pointer-events-none' : ''
      }
    />
  );
};

export default ResumeTable;
