import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} />);
    const input = screen.getByRole('checkbox');
    expect(input).not.toBeChecked();
  });

  it('renders checked', () => {
    render(<Checkbox checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('sets indeterminate via ref when indeterminate is true', () => {
    const { container } = render(
      <Checkbox checked={false} indeterminate={true} onChange={vi.fn()} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it('does not set indeterminate when indeterminate is false', () => {
    const { container } = render(
      <Checkbox checked={false} indeterminate={false} onChange={vi.fn()} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });

  it('does not set indeterminate when indeterminate is undefined', () => {
    const { container } = render(
      <Checkbox checked={false} onChange={vi.fn()} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });

  it('renders with a label linked by id', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} id="my-check" />);
    const label = screen.getByLabelText('');
    expect(label).toBeDefined();
  });
});
