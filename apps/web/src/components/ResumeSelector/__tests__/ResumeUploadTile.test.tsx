import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumeUploadTile from '../ResumeUploadTile';

describe('ResumeUploadTile', () => {
  it('renders the given label', () => {
    render(<ResumeUploadTile label="Upload Resume" onClick={vi.fn()} />);
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ResumeUploadTile label="Upload Resume" onClick={onClick} />);
    fireEvent.click(screen.getByText('Upload Resume'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows a spinner while uploading', () => {
    render(
      <ResumeUploadTile label="Upload Resume" isUploading onClick={vi.fn()} />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders different labels for different variants', () => {
    const { rerender } = render(
      <ResumeUploadTile label="Login to add resume" onClick={vi.fn()} />,
    );
    expect(screen.getByText('Login to add resume')).toBeInTheDocument();

    rerender(
      <ResumeUploadTile label="Upload More Resumes" onClick={vi.fn()} />,
    );
    expect(screen.getByText('Upload More Resumes')).toBeInTheDocument();
  });
});
