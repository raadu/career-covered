import { flexRender, type HeaderGroup } from '@tanstack/react-table';
import { hideBelowClass } from './tableColumnMeta';

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
            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 ${hideBelowClass(header.column.columnDef.meta?.hideBelow)}`}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

export default TableHeader;
