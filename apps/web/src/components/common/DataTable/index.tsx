import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from '@tanstack/react-table';
import { DndContext, closestCenter } from '@dnd-kit/core';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import SortableTableBody from './SortableTableBody';
import Pagination from './Pagination';
import { DEFAULT_PAGE_SIZES } from './tableColumnMeta';
import { useReorderDnd } from 'hooks/useReorderDnd';

interface BaseDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowClassName?: (row: T) => string;
}

interface SortableDataTableProps<T> extends BaseDataTableProps<T> {
  // Wraps rows in a dnd-kit SortableContext with drag-to-reorder — column
  // defs opt individual cells into being the drag handle via <DragHandle />
  // (see ResumeTable for the reference usage).
  sortable: true;
  getRowId: (row: T) => string;
  onReorder: (newData: T[]) => void;
}

interface StaticDataTableProps<T> extends BaseDataTableProps<T> {
  sortable?: false;
}

type DataTableProps<T> = StaticDataTableProps<T> | SortableDataTableProps<T>;

const DataTable = <T extends object>(props: DataTableProps<T>) => {
  const {
    columns,
    data,
    pageCount,
    pageIndex,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    isLoading,
    emptyMessage = 'No data found',
    getRowClassName,
    sortable,
  } = props;

  const getRowId = sortable ? props.getRowId : undefined;
  const onReorder = sortable ? props.onReorder : undefined;

  const table = useReactTable({
    columns,
    data,
    pageCount,
    state: { pagination: { pageIndex, pageSize: 10 } },
    onPaginationChange: () => {},
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  });

  // Called unconditionally (rules of hooks) — a no-op reorder/id pair when
  // this table isn't sortable, since handleDragEnd is then simply unused.
  const { handleDragEnd } = useReorderDnd(
    data,
    getRowId ?? (() => ''),
    onReorder ?? (() => {}),
  );

  const tableElement = (
    <table className="w-full border-collapse">
      <TableHeader headerGroups={table.getHeaderGroups()} />
      {sortable ? (
        <SortableTableBody
          rowModel={table.getRowModel()}
          columnsLength={columns.length}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          getRowClassName={getRowClassName}
        />
      ) : (
        <TableBody
          rowModel={table.getRowModel()}
          columnsLength={columns.length}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          getRowClassName={getRowClassName}
        />
      )}
    </table>
  );

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        {sortable ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {tableElement}
          </DndContext>
        ) : (
          tableElement
        )}
      </div>

      <Pagination
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
};

export default DataTable;
