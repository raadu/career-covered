import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumePreviewModal from '../ResumePreviewModal';

describe('ResumePreviewModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ResumePreviewModal isOpen={false} resumeId="r1" onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there is no resumeId, even if isOpen is true', () => {
    const { container } = render(
      <ResumePreviewModal isOpen={true} resumeId={null} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('points the iframe at the preview endpoint for the given resume id', () => {
    render(
      <ResumePreviewModal
        isOpen={true}
        resumeId="abc-123"
        resumeName="My Resume"
        onClose={vi.fn()}
      />,
    );
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', '/api/resumes/abc-123/preview');
    expect(screen.getByText('My Resume')).toBeInTheDocument();
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<ResumePreviewModal isOpen={true} resumeId="r1" onClose={onClose} />);
    // Modal portals to document.body, so the backdrop is the dialog's parent.
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the modal body', () => {
    const onClose = vi.fn();
    render(
      <ResumePreviewModal isOpen={true} resumeId="r1" onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on the close button', () => {
    const onClose = vi.fn();
    render(
      <ResumePreviewModal isOpen={true} resumeId="r1" onClose={onClose} />,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
