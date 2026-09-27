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
    // Modal shell owns the title now; content starts one step in.
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText(/You just need an API key/i)).toBeInTheDocument();
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
    expect(screen.getByText('Add Your API Key')).toBeInTheDocument();
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

  it('keeps Start disabled and stores nothing for a whitespace-only key', () => {
    const { store } = renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    const input = screen.getByPlaceholderText(/Enter your Groq API Key here/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByRole('button', { name: /Start/i })).toBeDisabled();
    expect(store.getState().coverLetter.apiKey).toBe('');
    expect(localStorage.getItem('cl_visited_before')).toBeNull();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace from a pasted key before storing it', () => {
    const { store } = renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    const input = screen.getByPlaceholderText(/Enter your Groq API Key here/i);
    fireEvent.change(input, { target: { value: '  gsk_abc123 \n' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    expect(store.getState().coverLetter.apiKey).toBe('gsk_abc123');
  });

  it('submits on Enter, but ignores other keys', () => {
    const { store } = renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    const input = screen.getByPlaceholderText(/Enter your Groq API Key here/i);
    fireEvent.change(input, { target: { value: 'test-key' } });

    fireEvent.keyDown(input, { key: 'a' });
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(store.getState().coverLetter.apiKey).toBe('test-key');
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('switches to the detailed guide and back, keeping the typed key', () => {
    renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    const input = screen.getByPlaceholderText(/Enter your Groq API Key here/i);
    fireEvent.change(input, { target: { value: 'half-typed' } });

    fireEvent.click(screen.getByText(/Still stuck\? Click here/i));
    expect(screen.getByText('Why do I need an API key?')).toBeInTheDocument();
    expect(screen.getByText('Step-by-step Guide')).toBeInTheDocument();
    expect(input).toHaveValue('half-typed');

    fireEvent.click(screen.getByRole('button', { name: /Back to simple guide/i }));
    expect(screen.queryByText('Step-by-step Guide')).not.toBeInTheDocument();
    expect(screen.getByText(/Still stuck\? Click here/i)).toBeInTheDocument();
  });

  it('opens every external provider link in a new tab without leaking window.opener', () => {
    renderWithProviders(
      <OnboardingModal isOpen={true} onComplete={onComplete} />,
    );
    fireEvent.click(screen.getByText(/Still stuck\? Click here/i));

    const link = screen.getByRole('link', { name: /Groq Cloud Console/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
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
