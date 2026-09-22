import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../Header';

const baseProps = {
  onViewModeChange: vi.fn(),
  showViewModeToggle: true,
  atCap: false,
  isUploading: false,
  onUpload: vi.fn(),
  onCapReached: vi.fn(),
};

describe('Header', () => {
  it('renders the title and subtitle', () => {
    render(<Header {...baseProps} viewMode="grid" />);
    expect(screen.getByText('Resumes')).toBeInTheDocument();
    expect(
      screen.getByText('Upload and manage your resumes here'),
    ).toBeInTheDocument();
  });

  it('renders the view mode toggle when showViewModeToggle is true', () => {
    render(<Header {...baseProps} viewMode="grid" />);
    expect(screen.getByTitle('Grid View')).toBeInTheDocument();
    expect(screen.getByTitle('List View')).toBeInTheDocument();
  });

  it('hides the view mode toggle when showViewModeToggle is false', () => {
    render(
      <Header {...baseProps} viewMode="grid" showViewModeToggle={false} />,
    );
    expect(screen.queryByTitle('Grid View')).not.toBeInTheDocument();
    expect(screen.queryByTitle('List View')).not.toBeInTheDocument();
  });

  it('hides the upload button in grid view', () => {
    render(<Header {...baseProps} viewMode="grid" />);
    expect(screen.queryByText('Upload Resume')).not.toBeInTheDocument();
  });

  it('shows the upload button in list view', () => {
    render(<Header {...baseProps} viewMode="list" />);
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
  });
});
