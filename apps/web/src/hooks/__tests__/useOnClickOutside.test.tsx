import { useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOnClickOutside } from '../useOnClickOutside';

interface TestHarnessProps {
  enabled: boolean;
  onOutsideClick: () => void;
}

function TestHarness({ enabled, onOutsideClick }: TestHarnessProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onOutsideClick, enabled);

  return (
    <div>
      <div ref={ref} data-testid="inside">
        Inside
      </div>
      <button data-testid="outside">Outside</button>
    </div>
  );
}

describe('useOnClickOutside', () => {
  it('calls the handler when clicking outside the ref element', () => {
    const onOutsideClick = vi.fn();
    render(<TestHarness enabled onOutsideClick={onOutsideClick} />);

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler when clicking inside the ref element', () => {
    const onOutsideClick = vi.fn();
    render(<TestHarness enabled onOutsideClick={onOutsideClick} />);

    fireEvent.mouseDown(screen.getByTestId('inside'));

    expect(onOutsideClick).not.toHaveBeenCalled();
  });

  it('does not attach a listener when disabled', () => {
    const onOutsideClick = vi.fn();
    render(<TestHarness enabled={false} onOutsideClick={onOutsideClick} />);

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(onOutsideClick).not.toHaveBeenCalled();
  });
});
