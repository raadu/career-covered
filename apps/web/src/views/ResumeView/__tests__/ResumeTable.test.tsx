import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumeTable from '../ResumeTable';
import type { Resume } from '../types';

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'Resume',
  originalFileName: 'r.pdf',
  mimeType: 'application/pdf',
  fileSize: 512 * 1024,
  order: 0,
  createdAt: '2026-08-05T00:00:00.000Z',
  updatedAt: '2026-08-06T00:00:00.000Z',
  ...overrides,
});

const baseProps = {
  busyId: null,
  selectedIds: new Set<string>(),
  allSelected: false,
  someSelected: false,
  onToggleSelectAll: vi.fn(),
  onToggleSelect: vi.fn(),
  onReorder: vi.fn(),
  onRename: vi.fn(),
  onPreview: vi.fn(),
  onDownload: vi.fn(),
  onReplace: vi.fn(),
  onDelete: vi.fn(),
  pageIndex: 0,
  pageSize: 10,
  pageCount: 1,
  total: 1,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('ResumeTable', () => {
  it('renders the column headers', () => {
    render(<ResumeTable {...baseProps} resumes={[mockResume()]} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders one row per resume', () => {
    const resumes = [
      mockResume({ id: 'a', name: 'Resume A' }),
      mockResume({ id: 'b', name: 'Resume B' }),
    ];
    render(<ResumeTable {...baseProps} resumes={resumes} />);
    expect(screen.getByText('Resume A')).toBeInTheDocument();
    expect(screen.getByText('Resume B')).toBeInTheDocument();
  });

  it('renders the empty-state message when there are no resumes', () => {
    render(<ResumeTable {...baseProps} resumes={[]} />);
    expect(
      screen.getByText('No resumes yet. Upload one to get started.'),
    ).toBeInTheDocument();
  });

  it('renders the formatted size, created, and updated cells', () => {
    render(<ResumeTable {...baseProps} resumes={[mockResume()]} />);
    expect(screen.getByText('512 KB')).toBeInTheDocument();
    expect(screen.getByText('Aug 5, 2026')).toBeInTheDocument();
    expect(screen.getByText('Aug 6, 2026')).toBeInTheDocument();
  });

  it('calls onToggleSelectAll when the header checkbox is clicked', () => {
    const onToggleSelectAll = vi.fn();
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume()]}
        onToggleSelectAll={onToggleSelectAll}
      />,
    );
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(onToggleSelectAll).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleSelect with the row id when a row checkbox is clicked', () => {
    const onToggleSelect = vi.fn();
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume({ id: 'r1' })]}
        onToggleSelect={onToggleSelect}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // 0 is select-all, 1 is the row
    expect(onToggleSelect).toHaveBeenCalledWith('r1');
  });

  it('reflects the isSelected state on the row checkbox', () => {
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume({ id: 'r1' })]}
        selectedIds={new Set(['r1'])}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
  });

  it('commits a rename through the inline-editable name cell', () => {
    const onRename = vi.fn();
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume({ id: 'r1', name: 'My Resume' })]}
        onRename={onRename}
      />,
    );

    fireEvent.click(screen.getByText('My Resume'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Renamed Resume' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRename).toHaveBeenCalledWith('r1', 'Renamed Resume');
  });

  it('renders a drag handle for each row', () => {
    render(<ResumeTable {...baseProps} resumes={[mockResume()]} />);
    expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
  });

  it('opens the kebab menu and triggers each action with the row id', () => {
    const onPreview = vi.fn();
    const onDownload = vi.fn();
    const onDelete = vi.fn();
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume({ id: 'r1' })]}
        onPreview={onPreview}
        onDownload={onDownload}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByTitle('Actions'));
    fireEvent.click(screen.getByRole('menuitem', { name: /view/i }));
    expect(onPreview).toHaveBeenCalledWith('r1');

    fireEvent.click(screen.getByTitle('Actions'));
    fireEvent.click(screen.getByRole('menuitem', { name: /download/i }));
    expect(onDownload).toHaveBeenCalledWith('r1');

    fireEvent.click(screen.getByTitle('Actions'));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('r1');
  });

  it('calls onReplace with the row id and selected file via the hidden input', () => {
    const onReplace = vi.fn();
    const { container } = render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume({ id: 'r1' })]}
        onReplace={onReplace}
      />,
    );

    const file = new File(['%PDF-1.4'], 'new.pdf', {
      type: 'application/pdf',
    });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onReplace).toHaveBeenCalledWith('r1', file);
  });

  it('shows a spinner and hides actions/drag-handle for the busy row', () => {
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume({ id: 'r1' })]}
        busyId="r1"
      />,
    );
    expect(screen.queryByTitle('Actions')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Drag to reorder')).not.toBeInTheDocument();
  });

  it('renders the pagination footer with the given total', () => {
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume()]}
        total={3}
        pageCount={1}
      />,
    );
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  it('hides the page-number navigation when there is only one page', () => {
    render(
      <ResumeTable {...baseProps} resumes={[mockResume()]} pageCount={1} />,
    );
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows page navigation and calls onPageChange when there are multiple pages', () => {
    const onPageChange = vi.fn();
    render(
      <ResumeTable
        {...baseProps}
        resumes={[mockResume()]}
        pageCount={2}
        total={2}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
