import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHiddenFileInput } from '../useHiddenFileInput';

function TestHarness({ onFile }: { onFile: (file: File) => void }) {
  const { inputRef, openPicker, handleChange } = useHiddenFileInput(onFile);
  return (
    <div>
      <button onClick={openPicker}>Open</button>
      <input
        ref={inputRef}
        type="file"
        data-testid="hidden-input"
        onChange={handleChange}
      />
    </div>
  );
}

describe('useHiddenFileInput', () => {
  it('openPicker triggers a click on the underlying input', () => {
    const input = HTMLInputElement.prototype.click;
    const clickSpy = vi.fn();
    HTMLInputElement.prototype.click = clickSpy;

    render(<TestHarness onFile={vi.fn()} />);
    fireEvent.click(screen.getByText('Open'));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    HTMLInputElement.prototype.click = input;
  });

  it('calls onFile with the selected file and resets the input value', () => {
    const onFile = vi.fn();
    render(<TestHarness onFile={onFile} />);

    const input = screen.getByTestId('hidden-input') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'resume.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFile).toHaveBeenCalledWith(file);
    expect(input.value).toBe('');
  });

  it('does not call onFile when no file is selected', () => {
    const onFile = vi.fn();
    render(<TestHarness onFile={onFile} />);

    const input = screen.getByTestId('hidden-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(onFile).not.toHaveBeenCalled();
  });
});
