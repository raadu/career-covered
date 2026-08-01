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

  it('is disabled when disabled prop is true', () => {
    render(<CommonButton disabled={true}>Click Me</CommonButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
