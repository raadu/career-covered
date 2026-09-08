import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumeTable from '../ResumeTable';
import type { Resume } from '../types';

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'Resume',
  originalFileName: 'r.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
  order: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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
