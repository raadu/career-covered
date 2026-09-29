import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DragHandle from '../DragHandle';
import { SortableRowContext } from '../SortableRowContext';

describe('DragHandle', () => {
  it('renders a labeled grip button when a sortable row context is provided', () => {
    render(
      <SortableRowContext.Provider
        value={{ attributes: {} as never, listeners: undefined }}
      >
        <DragHandle />
      </SortableRowContext.Provider>,
    );
    expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
  });

  it('throws when rendered outside a sortable row context', () => {
    // Expected: React logs the thrown error to the console during this
    // render — suppress it so the test output stays focused on the assertion.
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<DragHandle />)).toThrow(
      'useSortableRow (and <DragHandle />) must be used within a sortable DataTable row',
    );

    consoleError.mockRestore();
  });
});
