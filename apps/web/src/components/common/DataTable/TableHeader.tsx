import { flexRender, type HeaderGroup } from '@tanstack/react-table';

interface TableHeaderProps<T> {
  headerGroups: HeaderGroup<T>[];
}

const TableHeader = <T extends object>({
  headerGroups,
}: TableHeaderProps<T>) => (
  <thead>
    {headerGroups.map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th
            key={header.id}
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

export default TableHeader;
