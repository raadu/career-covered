import { useRef, useState } from 'react';
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

function MultiRefHarness({ onOutsideClick }: { onOutsideClick: () => void }) {
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const [refs] = useState(() => [firstRef, secondRef]);
  useOnClickOutside(refs, onOutsideClick, true);

  return (
    <div>
      <div ref={firstRef} data-testid="first">
        <span data-testid="first-child">First</span>
      </div>
      <div ref={secondRef} data-testid="second">
        Second
      </div>
      <button data-testid="outside">Outside</button>
    </div>
  );
}

describe('useOnClickOutside', () => {
  describe('with several refs', () => {
    it.each(['first', 'first-child', 'second'])(
      'treats a press inside %s as inside',
      (testId) => {
        const onOutsideClick = vi.fn();
        render(<MultiRefHarness onOutsideClick={onOutsideClick} />);

        fireEvent.mouseDown(screen.getByTestId(testId));

        expect(onOutsideClick).not.toHaveBeenCalled();
      },
    );

    it('calls the handler only when the press is outside every ref', () => {
      const onOutsideClick = vi.fn();
      render(<MultiRefHarness onOutsideClick={onOutsideClick} />);

      fireEvent.mouseDown(screen.getByTestId('outside'));

      expect(onOutsideClick).toHaveBeenCalledTimes(1);
    });
  });

  it('also reacts to touchstart outside the ref element', () => {
    const onOutsideClick = vi.fn();
    render(<TestHarness enabled onOutsideClick={onOutsideClick} />);

    fireEvent.touchStart(screen.getByTestId('outside'));

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

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
