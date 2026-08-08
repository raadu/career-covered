import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { FaFilePdf, FaFileWord, FaCopy, FaTrash } from 'react-icons/fa';
import DataTable from 'components/common/DataTable';
import Checkbox from 'views/TemplatesView/Checkbox';
import formatDate from './formatDate';
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
          <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-[300px] text-gray-500 dark:text-gray-400 block">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Template Used',
        id: 'template',
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {row.original.template?.name || 'N/A'}
          </span>
        ),
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 flex items-center gap-1 w-fit">
            <button
              onClick={() => onOpenDesigns(row.original)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
              title="Choose a PDF design"
            >
              <FaFilePdf size={12} />
            </button>
            <button
              onClick={() => onDownloadWord(row.original)}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
              title="Download as Word"
            >
              <FaFileWord size={12} />
            </button>
            <button
              onClick={() => onCopy(row.original)}
              className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-sm transition-colors"
              title="Copy to clipboard"
            >
              <FaCopy size={12} />
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
              title="Delete"
            >
              <FaTrash size={12} />
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
