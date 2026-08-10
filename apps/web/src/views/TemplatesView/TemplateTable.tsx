import { useMemo } from 'react';
import { type ColumnDef, type CellContext } from '@tanstack/react-table';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import DataTable from 'components/common/DataTable';
import formatDate from 'utils/dateUtils';
import Checkbox from './Checkbox';
import type { Template } from './types';

interface TemplateTableProps {
  data: Template[];
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
  onEdit: (tpl: Template) => void;
  onDelete: (id: string | null) => void;
}

const TemplateTable = ({
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
  onEdit,
  onDelete,
}: TemplateTableProps) => {
  const selectAllIndeterminate = someSelected && !allSelected;

  const columns: ColumnDef<Template>[] = useMemo(
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
        header: 'Name',
        accessorKey: 'name',
        cell: ({ getValue }: CellContext<Template, unknown>) => (
          <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[140px] sm:max-w-[180px] font-semibold text-gray-900 dark:text-gray-100 block">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Content',
        accessorKey: 'content',
        cell: ({ row }: CellContext<Template, unknown>) => (
          <span
            className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-[300px] text-gray-500 dark:text-gray-400 block cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => onEdit(row.original)}
            title="Click to edit"
          >
            {row.original.content}
          </span>
        ),
      },
      {
        header: 'Last Updated',
        accessorKey: 'updatedAt',
        cell: ({ getValue }: CellContext<Template, unknown>) => (
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }: CellContext<Template, unknown>) => (
          <div className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 flex items-center gap-1 w-fit">
            <button
              onClick={() => onEdit(row.original)}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
              title="Edit Template"
            >
              <FaPencilAlt size={12} />
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
              title="Delete Template"
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
      onEdit,
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
        emptyMessage="No templates yet. Create one to get started."
      />
    </div>
  );
};

export default TemplateTable;
