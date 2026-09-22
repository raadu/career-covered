import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CoverLetterGrid from '../CoverLetterGrid';
import type { CoverLetterItem } from '../types';

const mockItems: CoverLetterItem[] = Array.from({ length: 3 }, (_, i) => ({
  id: `c${i}`,
  jobTitle: `Title ${i}`,
  companyName: `Company ${i}`,
  jobDescription: `Job description ${i}`,
  generatedText: `Generated ${i}`,
  model: 'llama-3.3-70b-versatile',
  wordLimit: null,
  minimalChanges: null,
  sameLanguage: null,
  customPrompt: null,
  jobMarket: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  templateId: null,
  template: null,
}));

const baseProps = {
  items: mockItems,
  onOpenDesigns: vi.fn(),
  onDownloadWord: vi.fn(),
  onCopy: vi.fn(),
  onDelete: vi.fn(),
  page: 1,
  pageSize: 10,
  totalPages: 3,
  total: 25,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('CoverLetterGrid', () => {
  it('renders a card for each item', () => {
    render(<CoverLetterGrid {...baseProps} />);
    expect(screen.getByText('Job description 0')).toBeInTheDocument();
    expect(screen.getByText('Job description 1')).toBeInTheDocument();
    expect(screen.getByText('Job description 2')).toBeInTheDocument();
  });

  it('shows the empty message and no pagination when there are no items', () => {
    render(<CoverLetterGrid {...baseProps} items={[]} />);
    expect(
      screen.getByText('No saved cover letters yet. Generate one to get started.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders pagination controls reflecting the current page/total', () => {
    render(<CoverLetterGrid {...baseProps} />);
    expect(screen.getByText('25 total')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Prev')).toBeInTheDocument();
  });

  it('calls onPageChange with the next page index when Next is clicked', () => {
    const onPageChange = vi.fn();
    render(<CoverLetterGrid {...baseProps} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageSizeChange when the page size select changes', () => {
    const onPageSizeChange = vi.fn();
    render(
      <CoverLetterGrid {...baseProps} onPageSizeChange={onPageSizeChange} />,
    );
    fireEvent.change(screen.getByDisplayValue('10'), {
      target: { value: '20' },
    });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
