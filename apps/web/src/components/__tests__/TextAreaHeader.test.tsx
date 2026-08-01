import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { MouseEvent } from 'react';
import TextAreaHeader from '../common/CollapsibleTextArea/TextAreaHeader';

describe('TextAreaHeader', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'Some value',
    required: false,
    isExpanded: true,
    onToggleExpand: vi.fn(),
    handleCopy: vi.fn() as (e: MouseEvent) => void,
  };

  it('renders the label', () => {
    render(<TextAreaHeader {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('shows required asterisk when required is true', () => {
    render(<TextAreaHeader {...defaultProps} required={true} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show asterisk when required is false', () => {
    render(<TextAreaHeader {...defaultProps} required={false} />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('shows "Save as Template" button when onAddTemplate is provided', () => {
    render(<TextAreaHeader {...defaultProps} onAddTemplate={vi.fn()} />);
    expect(screen.getByText('Save as Template')).toBeInTheDocument();
  });

  it('does not show "Save as Template" button when onAddTemplate is not provided', () => {
    render(<TextAreaHeader {...defaultProps} />);
    expect(screen.queryByText('Save as Template')).not.toBeInTheDocument();
  });

  it('hides action buttons entirely when value is empty', () => {
    render(
      <TextAreaHeader
        {...defaultProps}
        value=""
        onAddTemplate={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.queryByText('Save as Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('enables "Save as Template" button when value is non-empty', () => {
    render(
      <TextAreaHeader
        {...defaultProps}
        value="Valid content"
        onAddTemplate={vi.fn()}
      />,
    );
    const btn = screen.getByText('Save as Template');
    expect(btn).toBeEnabled();
  });

  it('disables "Save as Template" button when value is only whitespace', () => {
    render(
      <TextAreaHeader {...defaultProps} value="   " onAddTemplate={vi.fn()} />,
    );
    // Value is trimmed to check - whitespace still truthy, button shown but disabled
    const btn = screen.getByText('Save as Template');
    expect(btn).toBeDisabled();
  });

  it('calls onAddTemplate when "Save as Template" is clicked', () => {
    const onAddTemplate = vi.fn();
    render(
      <TextAreaHeader
        {...defaultProps}
        value="Valid"
        onAddTemplate={onAddTemplate}
      />,
    );
    fireEvent.click(screen.getByText('Save as Template'));
    expect(onAddTemplate).toHaveBeenCalledOnce();
  });

  it('shows Clear button when onClear is provided', () => {
    render(<TextAreaHeader {...defaultProps} onClear={vi.fn()} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('hides Clear button when onClear is not provided', () => {
    render(<TextAreaHeader {...defaultProps} />);
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('calls onClear when Clear is clicked', () => {
    const onClear = vi.fn();
    render(<TextAreaHeader {...defaultProps} onClear={onClear} />);
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('calls handleCopy when Copy is clicked', () => {
    const handleCopy = vi.fn();
    render(<TextAreaHeader {...defaultProps} handleCopy={handleCopy} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(handleCopy).toHaveBeenCalledOnce();
  });

  it('calls onToggleExpand when header area is clicked', () => {
    render(<TextAreaHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Label'));
    expect(defaultProps.onToggleExpand).toHaveBeenCalled();
  });

  it('shows chevron up/down labels based on expanded state', () => {
    const { rerender } = render(
      <TextAreaHeader {...defaultProps} isExpanded={true} />,
    );
    expect(screen.getAllByLabelText('Collapse').length).toBe(2);

    rerender(<TextAreaHeader {...defaultProps} isExpanded={false} />);
    expect(screen.getAllByLabelText('Expand').length).toBe(2);
  });

  it('stops propagation on Clear button click so header toggle is not triggered', () => {
    const onToggleExpand = vi.fn();
    const onClear = vi.fn();
    render(
      <TextAreaHeader
        {...defaultProps}
        onToggleExpand={onToggleExpand}
        onClear={onClear}
      />,
    );
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalledOnce();
    expect(onToggleExpand).not.toHaveBeenCalled();
  });
});
