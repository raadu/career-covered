import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InlineEditableText from '../InlineEditableText';

describe('InlineEditableText', () => {
  it('renders the value as a button by default', () => {
    render(<InlineEditableText value="My Resume" onCommit={vi.fn()} />);
    expect(screen.getByText('My Resume')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('clicking the text enters edit mode with a focused, selected input', () => {
    render(<InlineEditableText value="My Resume" onCommit={vi.fn()} />);
    fireEvent.click(screen.getByText('My Resume'));

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('My Resume');
    expect(input).toHaveFocus();
  });

  it('commits the trimmed value on Enter when changed', () => {
    const onCommit = vi.fn();
    render(<InlineEditableText value="My Resume" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('My Resume'));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  New Name  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('New Name');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('commits on blur the same as Enter', () => {
    const onCommit = vi.fn();
    render(<InlineEditableText value="My Resume" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('My Resume'));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Blurred Name' } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith('Blurred Name');
  });

  it('does not commit when the value is unchanged', () => {
    const onCommit = vi.fn();
    render(<InlineEditableText value="My Resume" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('My Resume'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not commit when the trimmed value is empty', () => {
    const onCommit = vi.fn();
    render(<InlineEditableText value="My Resume" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('My Resume'));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText('My Resume')).toBeInTheDocument();
  });

  it('reverts to the original value on Escape without committing', () => {
    const onCommit = vi.fn();
    render(<InlineEditableText value="My Resume" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('My Resume'));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Discarded Edit' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText('My Resume')).toBeInTheDocument();
    expect(screen.queryByText('Discarded Edit')).not.toBeInTheDocument();
  });
});
