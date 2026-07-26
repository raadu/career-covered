import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from '@tanstack/react-table';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

interface DataTableProps<T> {
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
}

const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const DataTable = <T extends object>({
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
}: DataTableProps<T>) => {
  const table = useReactTable({
    columns,
    data,
    pageCount,
    state: { pagination: { pageIndex, pageSize: 10 } },
    onPaginationChange: () => {},
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
      <table className="w-full border-collapse">
        <TableHeader headerGroups={table.getHeaderGroups()} />
        <TableBody
          rowModel={table.getRowModel()}
          columnsLength={columns.length}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      </table>

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
