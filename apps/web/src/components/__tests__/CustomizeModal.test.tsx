import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomizeModal from '../Modals/CustomizeModal';

const initialOptions = {
  limitWords: false,
  wordCount: 400,
  limitCharacters: false,
  charCount: 0,
  minimalChanges: true,
  sameLanguage: false,
};

describe('CustomizeModal', () => {
  // Fresh mocks for every test — prevents call-count bleed between tests
  let onSave: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSave = vi.fn();
    onClose = vi.fn();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CustomizeModal
        isOpen={false}
        onClose={onClose}
        initialOptions={initialOptions}
        onSave={onSave}
        hasTemplate={true}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={initialOptions}
        onSave={onSave}
        hasTemplate={true}
      />,
    );
    expect(screen.getByText(/Cover Letter Customization/i)).toBeInTheDocument();
    expect(screen.getByText(/Limit words/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Prompt/i)).toBeInTheDocument();
  });

  it('calls onSave with correct data when Save is clicked', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={initialOptions}
        onSave={onSave}
        hasTemplate={true}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Save Options/i }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({
      options: initialOptions,
      customPrompt: '',
    });
  });

  it('shows validation error and blocks save when limitWords is enabled with invalid count', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        // Start with limitWords already ON so the text input is visible immediately
        initialOptions={{ ...initialOptions, limitWords: true }}
        onSave={onSave}
        hasTemplate={true}
      />,
    );

    // Set an out-of-range value (below 50)
    const input = screen.getByPlaceholderText(
      /Numbers should be between 50 - 1000/i,
    );
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Options/i }));

    expect(
      screen.getByText(/Numbers should be between 50 - 1000/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows validation error and blocks save when limitCharacters is enabled with invalid count', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={{ ...initialOptions, limitCharacters: true }}
        onSave={onSave}
        hasTemplate={true}
      />,
    );

    const input = screen.getByPlaceholderText(/e\.g\. 2000 \(200 - 5000\)/i);
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Options/i }));

    expect(
      screen.getByText(/Numbers should be between 200 - 5000/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('blocks save when limitCharacters is enabled but left empty (no silent default)', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={{ ...initialOptions, limitCharacters: true }}
        onSave={onSave}
        hasTemplate={true}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Save Options/i }));

    expect(
      screen.getByText(/Numbers should be between 200 - 5000/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('unchecking limitWords when limitCharacters is checked, and vice versa', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={initialOptions}
        onSave={onSave}
        hasTemplate={true}
      />,
    );

    const wordsCheckbox = screen.getByLabelText(/Limit words/i);
    const charsCheckbox = screen.getByLabelText(/Limit characters/i);

    fireEvent.click(wordsCheckbox);
    expect(wordsCheckbox).toBeChecked();
    expect(charsCheckbox).not.toBeChecked();

    fireEvent.click(charsCheckbox);
    expect(charsCheckbox).toBeChecked();
    expect(wordsCheckbox).not.toBeChecked();
  });

  it('handles malicious custom prompt safely (passes raw value to parent, sanitized at logic layer)', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={initialOptions}
        onSave={onSave}
        hasTemplate={true}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      /Wanna add or remove anything/i,
    );
    const maliciousPayload = '<script>alert(1)</script>';
    fireEvent.change(textarea, { target: { value: maliciousPayload } });
    fireEvent.click(screen.getByRole('button', { name: /Save Options/i }));

    expect(onSave).toHaveBeenCalledWith({
      options: initialOptions,
      customPrompt: maliciousPayload,
    });
  });

  it('resets options when Reset button is clicked', () => {
    render(
      <CustomizeModal
        isOpen={true}
        onClose={onClose}
        initialOptions={initialOptions}
        onSave={onSave}
        hasTemplate={true}
      />,
    );

    // Change some value
    const checkbox = screen.getByLabelText(/Limit words/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Click Reset
    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    // Verify it's back to initial (limitWords: false)
    expect(checkbox).not.toBeChecked();
  });
});
