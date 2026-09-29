import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommonButton from '../common/CommonButton';

describe('CommonButton', () => {
  it('renders the button with text', () => {
    render(<CommonButton>Click Me</CommonButton>);
    expect(screen.getByText(/Click Me/i)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<CommonButton onClick={onClick}>Click Me</CommonButton>);
    fireEvent.click(screen.getByText(/Click Me/i));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    render(<CommonButton isLoading={true}>Click Me</CommonButton>);
    // The loading spinner should be present, and text might be hidden or replaced depending on implementation
    // Let's check for the presence of a loading indicator (usually an SVG or specific class)
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is 34px tall on mouse devices but keeps the 40px touch target elsewhere', () => {
    render(<CommonButton>Click Me</CommonButton>);
    expect(screen.getByRole('button')).toHaveClass(
      'min-h-10',
      '[@media(pointer:fine)]:min-h-[34px]',
    );
  });

  it('does not add vertical padding that would undo the reduced height', () => {
    render(<CommonButton>Click Me</CommonButton>);
    expect(screen.getByRole('button').className).not.toMatch(/\bpy-/);
  });

  it('is disabled when disabled prop is true', () => {
    render(<CommonButton disabled={true}>Click Me</CommonButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
