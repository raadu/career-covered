import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BatchActionBar from '../BatchActionBar';

describe('BatchActionBar', () => {
  it('renders selected count', () => {
    render(
      <BatchActionBar selectedCount={3} onDelete={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('renders singular count', () => {
    render(
      <BatchActionBar selectedCount={1} onDelete={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(
      <BatchActionBar
        selectedCount={2}
        onDelete={onDelete}
        onClear={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Delete Selected'));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    render(
      <BatchActionBar selectedCount={2} onDelete={vi.fn()} onClear={onClear} />,
    );
    fireEvent.click(screen.getByText('Clear selection'));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
