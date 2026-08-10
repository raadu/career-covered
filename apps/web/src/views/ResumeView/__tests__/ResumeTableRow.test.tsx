import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumeTableRow from '../ResumeTableRow';
import type { Resume } from '../types';

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'My Resume',
  originalFileName: 'my-resume.pdf',
  mimeType: 'application/pdf',
  fileSize: 512 * 1024,
  order: 0,
  createdAt: '2026-08-05T00:00:00.000Z',
  updatedAt: '2026-08-06T00:00:00.000Z',
  ...overrides,
});

function renderRow(props: Partial<React.ComponentProps<typeof ResumeTableRow>> = {}) {
  const defaultProps: React.ComponentProps<typeof ResumeTableRow> = {
    resume: mockResume(),
    isBusy: false,
    isSelected: false,
    onToggleSelect: vi.fn(),
    onRename: vi.fn(),
    onPreview: vi.fn(),
    onDownload: vi.fn(),
    onReplace: vi.fn(),
    onDelete: vi.fn(),
    ...props,
  };
  return render(
    <table>
      <tbody>
        <ResumeTableRow {...defaultProps} />
      </tbody>
    </table>,
  );
}

describe('ResumeTableRow', () => {
  it('renders the formatted size, created, and updated cells', () => {
    renderRow();
    expect(screen.getByText('512 KB')).toBeInTheDocument();
    expect(screen.getByText('Aug 5, 2026')).toBeInTheDocument();
    expect(screen.getByText('Aug 6, 2026')).toBeInTheDocument();
  });

  it('renders the resume name via InlineEditableText', () => {
    renderRow();
    expect(screen.getByText('My Resume')).toBeInTheDocument();
  });

  it('commits a rename through InlineEditableText', () => {
    const onRename = vi.fn();
    renderRow({ onRename });

    fireEvent.click(screen.getByText('My Resume'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Renamed Resume' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRename).toHaveBeenCalledWith('Renamed Resume');
  });

  it('renders the drag handle', () => {
    renderRow();
    expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
  });

  it('opens the kebab menu and triggers each action', () => {
    const onPreview = vi.fn();
    const onDownload = vi.fn();
    const onDelete = vi.fn();
    renderRow({ onPreview, onDownload, onDelete });

    fireEvent.click(screen.getByTitle('Actions'));
    fireEvent.click(screen.getByRole('menuitem', { name: /view/i }));
    expect(onPreview).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Actions'));
    fireEvent.click(screen.getByRole('menuitem', { name: /download/i }));
    expect(onDownload).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Actions'));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onReplace with the selected file via the hidden input', () => {
    const onReplace = vi.fn();
    const { container } = renderRow({ onReplace });

    const file = new File(['%PDF-1.4'], 'new.pdf', {
      type: 'application/pdf',
    });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onReplace).toHaveBeenCalledWith(file);
  });

  it('shows a spinner and hides actions when busy', () => {
    renderRow({ isBusy: true });
    expect(screen.queryByTitle('Actions')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Drag to reorder')).not.toBeInTheDocument();
  });

  it('reflects the isSelected prop on the checkbox', () => {
    renderRow({ isSelected: true });
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggleSelect when the checkbox is clicked', () => {
    const onToggleSelect = vi.fn();
    renderRow({ onToggleSelect });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggleSelect).toHaveBeenCalledTimes(1);
  });
});
