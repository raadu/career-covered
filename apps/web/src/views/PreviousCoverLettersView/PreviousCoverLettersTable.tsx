import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { FaFilePdf, FaFileWord, FaCopy, FaTrash } from 'react-icons/fa';
import DataTable from 'components/common/DataTable';
import { tableActionButtonClass } from 'components/common/DataTable/tableColumnMeta';
import { ICON_SIZE } from 'components/common/iconSizes';
import formatDate from 'utils/dateUtils';
import Checkbox from 'components/common/Checkbox';
import type { CoverLetterItem } from './types';

interface PreviousCoverLettersTableProps {
  data: CoverLetterItem[];
  totalPages: number;
  page: number;
  pageSize: number;
  total: number;
  isLoading: boolean;
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onOpenDesigns: (item: CoverLetterItem) => void;
  onDownloadWord: (item: CoverLetterItem) => void;
  onCopy: (item: CoverLetterItem) => void;
  onDelete: (id: string | null) => void;
}

const PreviousCoverLettersTable = ({
  data,
  totalPages,
  page,
  pageSize,
  total,
  isLoading,
  selectedIds,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleSelect,
  onPageChange,
  onPageSizeChange,
  onOpenDesigns,
  onDownloadWord,
  onCopy,
  onDelete,
}: PreviousCoverLettersTableProps) => {
  const selectAllIndeterminate = someSelected && !allSelected;

  const columns: ColumnDef<CoverLetterItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={selectAllIndeterminate}
            onChange={onToggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.has(row.original.id)}
            onChange={() => onToggleSelect(row.original.id)}
            id={`select-${row.original.id}`}
          />
        ),
        enableSorting: false,
      },
      {
        header: 'Job Description',
        accessorKey: 'jobDescription',
        cell: ({ getValue }) => (
          <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-[300px] text-neutral-500 dark:text-neutral-400 block">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Template Used',
        id: 'template',
        meta: { hideBelow: 'lg' },
        cell: ({ row }) => (
          <span className="text-neutral-500 dark:text-neutral-400">
            {row.original.template?.name || 'N/A'}
          </span>
        ),
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        meta: { hideBelow: 'md' },
        cell: ({ getValue }) => (
          <span className="text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 w-fit">
            <button
              onClick={() => onOpenDesigns(row.original)}
              className={tableActionButtonClass}
              title="Choose a PDF design"
            >
              <FaFilePdf size={ICON_SIZE.xs} />
            </button>
            <button
              onClick={() => onDownloadWord(row.original)}
              className={tableActionButtonClass}
              title="Download as Word"
            >
              <FaFileWord size={ICON_SIZE.xs} />
            </button>
            <button
              onClick={() => onCopy(row.original)}
              className={tableActionButtonClass}
              title="Copy to clipboard"
            >
              <FaCopy size={ICON_SIZE.xs} />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className={tableActionButtonClass}
              title="Delete"
            >
              <FaTrash size={ICON_SIZE.xs} />
            </button>
          </div>
        ),
      },
    ],
    [
      selectedIds,
      allSelected,
      selectAllIndeterminate,
      onToggleSelectAll,
      onToggleSelect,
      onOpenDesigns,
      onDownloadWord,
      onCopy,
      onDelete,
    ],
  );

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={data}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        emptyMessage="No saved cover letters yet. Generate one to get started."
      />
    </div>
  );
};

export default PreviousCoverLettersTable;
