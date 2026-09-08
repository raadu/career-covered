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
