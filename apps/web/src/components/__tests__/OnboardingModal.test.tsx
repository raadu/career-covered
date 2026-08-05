import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OnboardingModal from '../Modals/OnboardingModal';

describe('OnboardingModal', () => {
  let onComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onComplete = vi.fn();
    localStorage.clear();
  });

  it('renders correctly when open', () => {
    renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    expect(screen.getByText(/It’s so easy to start!/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your Groq API Key here/i),
    ).toBeInTheDocument();
  });

  it('shows help title when onClose is provided', () => {
    renderWithProviders(
      <OnboardingModal
        isOpen={true}
        onComplete={onComplete}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/How to get your API Key/i)).toBeInTheDocument();
  });

  it('dispatches setApiKey and calls onComplete when Start is clicked', () => {
    const { store } = renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );

    const input = screen.getByPlaceholderText(/Enter your Groq API Key here/i);
    fireEvent.change(input, { target: { value: 'test-key' } });

    const startButton = screen.getByRole('button', { name: /Start/i });
    fireEvent.click(startButton);

    expect(store.getState().coverLetter.apiKey).toBe('test-key');
    expect(localStorage.getItem('cl_visited_before')).toBe('true');
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('disables Start button if input is empty', () => {
    renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    const startButton = screen.getByRole('button', { name: /Start/i });
    expect(startButton).toBeDisabled();
  });

  it('calls onClose when close icon is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <OnboardingModal
        isOpen={true}
        onComplete={onComplete}
        onClose={onClose}
      />,
    );
    // FaTimes has aria-label="Close"
    const closeBtn = screen.getByLabelText(/Close/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
