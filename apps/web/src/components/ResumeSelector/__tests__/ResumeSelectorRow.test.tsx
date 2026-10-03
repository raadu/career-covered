import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumeSelectorRow from '../ResumeSelectorRow';
import type { Resume } from 'views/ResumeView/types';

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'My Resume',
  originalFileName: 'my-resume.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
  order: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('ResumeSelectorRow', () => {
  it('renders the resume name', () => {
    render(
      <ResumeSelectorRow
        resume={mockResume()}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onPreview={vi.fn()}
      />,
    );
    expect(screen.getByText('My Resume')).toBeInTheDocument();
  });

  it('is compact: tight row padding, and the preview button does not set the row height', () => {
    render(
      <ResumeSelectorRow
        resume={mockResume()}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onPreview={vi.fn()}
      />,
    );
    const row = screen.getByText('My Resume').parentElement!;
    expect(row).toHaveClass('py-1.5', 'px-1');
    expect(row).not.toHaveClass('p-1');

    const preview = screen.getByTitle('Preview');
    expect(preview).toHaveClass('min-h-8', '-my-1.5', 'min-w-10');
    expect(preview).not.toHaveClass('min-h-10');
  });

  it('gives a selected row a solid brand-800 fill matching its border, with white text and icon', () => {
    render(
      <ResumeSelectorRow
        resume={mockResume()}
        isSelected={true}
        onToggleSelect={vi.fn()}
        onPreview={vi.fn()}
      />,
    );
    const name = screen.getByText('My Resume');
    const row = name.parentElement!;
    expect(row).toHaveClass(
      'bg-brand-800',
      'border-brand-800',
    );
    expect(row.className).not.toMatch(/dark:(bg|border)-brand/);
    expect(name).toHaveClass('font-semibold', 'text-white');
    expect(screen.getByTitle('Preview')).toHaveClass('text-brand-100');
  });

  it('keeps an unselected row white with the neutral border', () => {
    render(
      <ResumeSelectorRow
        resume={mockResume()}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onPreview={vi.fn()}
      />,
    );
    const row = screen.getByText('My Resume').parentElement!;
    expect(row).toHaveClass('bg-white', 'border-neutral-200');
    expect(row).not.toHaveClass('bg-brand-800');
    expect(screen.getByTitle('Preview')).toHaveClass('text-neutral-400');
  });

  it('calls onToggleSelect when the row is clicked', () => {
    const onToggleSelect = vi.fn();
    render(
      <ResumeSelectorRow
        resume={mockResume()}
        isSelected={false}
        onToggleSelect={onToggleSelect}
        onPreview={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('My Resume'));
    expect(onToggleSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onPreview (not onToggleSelect) when the preview icon is clicked', () => {
    const onToggleSelect = vi.fn();
    const onPreview = vi.fn();
    render(
      <ResumeSelectorRow
        resume={mockResume()}
        isSelected={false}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByTitle('Preview'));
    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onToggleSelect).not.toHaveBeenCalled();
  });
});
