import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { type ColumnDef } from '@tanstack/react-table';
import DataTable from '../index';
import DragHandle from '../DragHandle';

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: 'a', name: 'Row A' },
  { id: 'b', name: 'Row B' },
];

const nameColumns: ColumnDef<Row>[] = [
  { header: 'Name', accessorKey: 'name' },
];

const basePaginationProps = {
  pageCount: 1,
  pageIndex: 0,
  pageSize: 10,
  total: rows.length,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('DataTable — static (non-sortable)', () => {
  it('renders a row per data item and no drag handles', () => {
    render(
      <DataTable columns={nameColumns} data={rows} {...basePaginationProps} />,
    );
    expect(screen.getByText('Row A')).toBeInTheDocument();
    expect(screen.getByText('Row B')).toBeInTheDocument();
    expect(screen.queryByTitle('Drag to reorder')).not.toBeInTheDocument();
  });

  it('renders the empty message when there is no data', () => {
    render(
      <DataTable
        columns={nameColumns}
        data={[]}
        {...basePaginationProps}
        emptyMessage="Nothing here"
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('applies getRowClassName to each row', () => {
    const { container } = render(
      <DataTable
        columns={nameColumns}
        data={rows}
        {...basePaginationProps}
        getRowClassName={(row) => (row.id === 'a' ? 'highlighted' : '')}
      />,
    );
    const highlighted = container.querySelector('tr.highlighted');
    expect(highlighted?.textContent).toContain('Row A');
  });
});

describe('DataTable — sortable', () => {
  const dragHandleColumns: ColumnDef<Row>[] = [
    { header: 'Name', accessorKey: 'name' },
    {
      id: 'drag',
      header: '',
      cell: () => <DragHandle />,
    },
  ];

  it('renders a drag handle per row when a column uses <DragHandle />', () => {
    render(
      <DataTable
        columns={dragHandleColumns}
        data={rows}
        {...basePaginationProps}
        sortable
        getRowId={(row) => row.id}
        onReorder={vi.fn()}
      />,
    );
    expect(screen.getAllByTitle('Drag to reorder')).toHaveLength(rows.length);
  });

  it('still renders the empty message when sortable with no data', () => {
    render(
      <DataTable
        columns={dragHandleColumns}
        data={[]}
        {...basePaginationProps}
        sortable
        getRowId={(row) => row.id}
        onReorder={vi.fn()}
        emptyMessage="Nothing to sort"
      />,
    );
    expect(screen.getByText('Nothing to sort')).toBeInTheDocument();
  });

  it('applies getRowClassName to each sortable row too', () => {
    const { container } = render(
      <DataTable
        columns={dragHandleColumns}
        data={rows}
        {...basePaginationProps}
        sortable
        getRowId={(row) => row.id}
        onReorder={vi.fn()}
        getRowClassName={(row) => (row.id === 'b' ? 'highlighted' : '')}
      />,
    );
    const highlighted = container.querySelector('tr.highlighted');
    expect(highlighted?.textContent).toContain('Row B');
  });
});

describe('DataTable — pagination', () => {
  it('calls onPageChange when navigating to the next page', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={nameColumns}
        data={rows}
        {...basePaginationProps}
        pageCount={2}
        total={2}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
