import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tooltip from '../Tooltip';
import { tooltipPosition, viewportNudge } from '../tooltipPosition';

const renderTooltip = (side?: 'right' | 'bottom' | 'left') =>
  render(
    <Tooltip label="FAQ" side={side} className="custom-wrapper">
      <button aria-label="FAQ">?</button>
    </Tooltip>,
  );

const wrapperOf = () => screen.getByRole('button').parentElement!;

describe('Tooltip', () => {
  it('renders nothing until the trigger is hovered or focused', () => {
    renderTooltip();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the label on mouse enter and hides it on mouse leave', () => {
    renderTooltip();

    fireEvent.mouseEnter(wrapperOf());
    expect(screen.getByRole('tooltip')).toHaveTextContent('FAQ');

    fireEvent.mouseLeave(wrapperOf());
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows on keyboard focus and hides on blur', () => {
    renderTooltip();

    fireEvent.focus(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides once the trigger is clicked', () => {
    renderTooltip();
    fireEvent.mouseEnter(wrapperOf());
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('portals into document.body so an ancestor cannot clip it', () => {
    renderTooltip();
    fireEvent.mouseEnter(wrapperOf());
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.parentElement).toBe(document.body);
    expect(wrapperOf()).not.toContainElement(tooltip);
  });

  it('links the trigger to the tooltip only while it is visible', () => {
    renderTooltip();
    expect(wrapperOf()).not.toHaveAttribute('aria-describedby');

    fireEvent.mouseEnter(wrapperOf());
    expect(wrapperOf()).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('tooltip').id,
    );
  });

  it('passes className through to the wrapper for layout', () => {
    renderTooltip();
    expect(wrapperOf()).toHaveClass('flex', 'custom-wrapper');
  });

  it.each([
    ['right', '-translate-y-1/2'],
    ['left', '-translate-x-full'],
    ['bottom', '-translate-x-1/2'],
  ] as const)('applies the %s-side centring class', (side, cls) => {
    renderTooltip(side);
    fireEvent.mouseEnter(wrapperOf());
    expect(screen.getByRole('tooltip')).toHaveClass(cls);
  });
});

describe('viewportNudge', () => {
  it('does not move a tooltip that already fits', () => {
    expect(viewportNudge({ left: 10, right: 100 }, 375)).toBe(0);
  });

  it('treats a tooltip exactly at the 4px margin as fitting', () => {
    expect(viewportNudge({ left: 4, right: 371 }, 375)).toBe(0);
  });

  it('pulls a tooltip hanging off the right edge back inside the margin', () => {
    // right edge at 400 on a 375px screen → must end at 371.
    expect(viewportNudge({ left: 330, right: 400 }, 375)).toBe(-29);
  });

  it('pushes a tooltip hanging off the left edge back inside the margin', () => {
    expect(viewportNudge({ left: -20, right: 50 }, 375)).toBe(24);
  });
});

describe('Tooltip viewport clamping', () => {
  it('shifts a rendered tooltip back on-screen via marginLeft', () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        top: 0,
        bottom: 20,
        left: 340,
        right: 400,
        width: 60,
        height: 20,
      } as DOMRect);
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);

    renderTooltip('bottom');
    fireEvent.mouseEnter(wrapperOf());
    expect(screen.getByRole('tooltip').style.marginLeft).toBe('-29px');

    rectSpy.mockRestore();
    vi.restoreAllMocks();
  });
});

describe('tooltipPosition', () => {
  const rect = {
    top: 100,
    bottom: 140,
    left: 20,
    right: 60,
    width: 40,
    height: 40,
  } as DOMRect;

  it('anchors to the right edge, vertically centred', () => {
    expect(tooltipPosition(rect, 'right')).toEqual({ top: 120, left: 66 });
  });

  it('anchors to the left edge, vertically centred', () => {
    expect(tooltipPosition(rect, 'left')).toEqual({ top: 120, left: 14 });
  });

  it('anchors below the bottom edge, horizontally centred', () => {
    expect(tooltipPosition(rect, 'bottom')).toEqual({ top: 146, left: 40 });
  });

  it('handles a zero-size trigger without producing NaN', () => {
    const empty = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
    } as DOMRect;
    expect(tooltipPosition(empty, 'bottom')).toEqual({ top: 6, left: 0 });
  });
});
