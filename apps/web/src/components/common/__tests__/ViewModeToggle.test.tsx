import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ViewModeToggle from '../ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders both buttons with the correct tooltips', () => {
    render(<ViewModeToggle viewMode="grid" onChange={vi.fn()} />);
    expect(screen.getByTitle('Grid View')).toBeInTheDocument();
    expect(screen.getByTitle('List View')).toBeInTheDocument();
  });

  it('marks the active view as pressed', () => {
    render(<ViewModeToggle viewMode="grid" onChange={vi.fn()} />);
    expect(screen.getByTitle('Grid View')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTitle('List View')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onChange with "list" when the List button is clicked', () => {
    const onChange = vi.fn();
    render(<ViewModeToggle viewMode="grid" onChange={onChange} />);
    fireEvent.click(screen.getByTitle('List View'));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('calls onChange with "grid" when the Grid button is clicked', () => {
    const onChange = vi.fn();
    render(<ViewModeToggle viewMode="list" onChange={onChange} />);
    fireEvent.click(screen.getByTitle('Grid View'));
    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
