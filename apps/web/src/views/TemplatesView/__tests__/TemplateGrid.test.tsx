import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateGrid from '../TemplateGrid';
import type { Template } from '../types';

const mockTemplates: Template[] = Array.from({ length: 3 }, (_, i) => ({
  id: `t${i}`,
  name: `Template ${i}`,
  content: `Content ${i}`,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
}));

const baseProps = {
  templates: mockTemplates,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  page: 1,
  pageSize: 10,
  totalPages: 3,
  total: 25,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('TemplateGrid', () => {
  it('renders a card for each template', () => {
    render(<TemplateGrid {...baseProps} />);
    expect(screen.getByText('Template 0')).toBeInTheDocument();
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    expect(screen.getByText('Template 2')).toBeInTheDocument();
  });

  it('shows the empty message and no pagination when there are no templates', () => {
    render(<TemplateGrid {...baseProps} templates={[]} />);
    expect(
      screen.getByText('No templates yet. Create one to get started.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders pagination controls reflecting the current page/total', () => {
    render(<TemplateGrid {...baseProps} />);
    expect(screen.getByText('25 total')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Prev')).toBeInTheDocument();
  });

  it('calls onPageChange with the next page index when Next is clicked', () => {
    const onPageChange = vi.fn();
    render(<TemplateGrid {...baseProps} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageSizeChange when the page size select changes', () => {
    const onPageSizeChange = vi.fn();
    render(
      <TemplateGrid {...baseProps} onPageSizeChange={onPageSizeChange} />,
    );
    fireEvent.change(screen.getByDisplayValue('10'), {
      target: { value: '20' },
    });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
