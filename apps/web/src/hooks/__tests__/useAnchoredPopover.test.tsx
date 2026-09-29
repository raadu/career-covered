import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAnchoredPopover } from '../useAnchoredPopover';

const getStyle = vi.fn((rect: DOMRect) => ({ top: rect.bottom, left: rect.left }));

function Harness() {
  const { isOpen, style, triggerRef, panelRef, toggle } =
    useAnchoredPopover(getStyle);
  return (
    <div>
      <button ref={triggerRef} onClick={toggle}>
        Trigger
      </button>
      {style && (
        <div ref={panelRef} data-testid="panel" style={style}>
          <button>Inside</button>
        </div>
      )}
      <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
      <button>Outside</button>
    </div>
  );
}

const state = () => screen.getByTestId('state').textContent;

describe('useAnchoredPopover', () => {
  it('starts closed with no style', () => {
    render(<Harness />);
    expect(state()).toBe('closed');
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('opens with the style computed from the trigger rect, and toggles closed', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 50,
      left: 10,
    } as DOMRect);
    render(<Harness />);

    fireEvent.click(screen.getByText('Trigger'));
    expect(state()).toBe('open');
    expect(screen.getByTestId('panel').style.top).toBe('50px');
    expect(screen.getByTestId('panel').style.left).toBe('10px');

    fireEvent.click(screen.getByText('Trigger'));
    expect(state()).toBe('closed');
    vi.restoreAllMocks();
  });

  it('stays open on a press inside the panel or on the trigger', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger'));

    fireEvent.mouseDown(screen.getByText('Inside'));
    fireEvent.mouseDown(screen.getByText('Trigger'));
    expect(state()).toBe('open');
  });

  it('closes on a press outside', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger'));
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(state()).toBe('closed');
  });

  it('closes on Escape and returns focus to the trigger, ignoring other keys', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger'));

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(state()).toBe('open');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(state()).toBe('closed');
    expect(screen.getByText('Trigger')).toHaveFocus();
  });

  it('closes on resize, since the anchor position goes stale', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger'));
    fireEvent(window, new Event('resize'));
    expect(state()).toBe('closed');
  });

  it('does not react to Escape or resize while closed', () => {
    render(<Harness />);
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent(window, new Event('resize'));
    expect(state()).toBe('closed');
    expect(screen.getByText('Trigger')).not.toHaveFocus();
  });
});
