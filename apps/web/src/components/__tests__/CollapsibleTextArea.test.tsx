import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CollapsibleTextArea from '../common/CollapsibleTextArea';

describe('CollapsibleTextArea', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'Test Value',
    onChange: vi.fn(),
    isExpanded: true,
    onToggleExpand: vi.fn(),
  };

  it('renders with label and value', () => {
    render(<CollapsibleTextArea {...defaultProps} />);
    expect(screen.getByText(/Test Label/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Test Value/i)).toBeInTheDocument();
  });

  it('toggles expansion when header is clicked', () => {
    render(<CollapsibleTextArea {...defaultProps} />);
    const header = screen.getByText(/Test Label/i);
    fireEvent.click(header);
    expect(defaultProps.onToggleExpand).toHaveBeenCalled();
  });

  it('calls onChange when user types', () => {
    render(<CollapsibleTextArea {...defaultProps} />);
    const textarea = screen.getByDisplayValue(/Test Value/i);
    fireEvent.change(textarea, { target: { value: 'New Value' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('New Value');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<CollapsibleTextArea {...defaultProps} required={true} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
