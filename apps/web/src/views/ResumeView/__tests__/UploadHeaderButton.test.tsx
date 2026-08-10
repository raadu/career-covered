import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadHeaderButton from '../UploadHeaderButton';

describe('UploadHeaderButton', () => {
  it('opens the file picker when not at cap', () => {
    const clickSpy = vi.fn();
    const original = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = clickSpy;

    const onCapReached = vi.fn();
    render(
      <UploadHeaderButton
        atCap={false}
        isUploading={false}
        onUpload={vi.fn()}
        onCapReached={onCapReached}
      />,
    );
    fireEvent.click(screen.getByText('Upload Resume'));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(onCapReached).not.toHaveBeenCalled();
    HTMLInputElement.prototype.click = original;
  });

  it('calls onCapReached instead of opening the picker when at cap', () => {
    const clickSpy = vi.fn();
    const original = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = clickSpy;

    const onCapReached = vi.fn();
    render(
      <UploadHeaderButton
        atCap
        isUploading={false}
        onUpload={vi.fn()}
        onCapReached={onCapReached}
      />,
    );
    fireEvent.click(screen.getByText('Upload Resume'));

    expect(onCapReached).toHaveBeenCalledTimes(1);
    expect(clickSpy).not.toHaveBeenCalled();
    HTMLInputElement.prototype.click = original;
  });

  it('calls onUpload with the selected file', () => {
    const onUpload = vi.fn();
    render(
      <UploadHeaderButton
        atCap={false}
        isUploading={false}
        onUpload={onUpload}
        onCapReached={vi.fn()}
      />,
    );

    const file = new File(['%PDF-1.4'], 'resume.pdf', {
      type: 'application/pdf',
    });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('shows the loading state while uploading', () => {
    render(
      <UploadHeaderButton
        atCap={false}
        isUploading
        onUpload={vi.fn()}
        onCapReached={vi.fn()}
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByText('Upload Resume')).not.toBeInTheDocument();
  });
});
