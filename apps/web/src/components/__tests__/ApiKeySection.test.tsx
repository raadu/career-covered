import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApiKeySection from '../GeneratorControls/ApiKeySection';

describe('ApiKeySection', () => {
  const renderSection = (
    overrides: Partial<React.ComponentProps<typeof ApiKeySection>> = {},
  ) => {
    const props = {
      apiKey: '',
      setApiKey: vi.fn(),
      showKeyInput: false,
      setShowKeyInput: vi.fn(),
      setShowHelpModal: vi.fn(),
      ...overrides,
    };
    render(<ApiKeySection {...props} />);
    return props;
  };

  describe('collapsed (no input shown)', () => {
    it('offers to add a key when none is set', () => {
      renderSection();
      expect(
        screen.getByRole('button', { name: /Add Custom API Key/i }),
      ).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/API Key/i)).not.toBeInTheDocument();
    });

    it('offers to update the key when one is already set', () => {
      renderSection({ apiKey: 'gsk_existing' });
      expect(
        screen.getByRole('button', { name: /Update API Key/i }),
      ).toBeInTheDocument();
    });

    it('never renders the stored key as visible text', () => {
      renderSection({ apiKey: 'gsk_secret_value' });
      expect(screen.queryByText(/gsk_secret_value/)).not.toBeInTheDocument();
    });

    it('expands the input when the add/update button is clicked', () => {
      const props = renderSection();
      fireEvent.click(screen.getByRole('button', { name: /Add Custom API Key/i }));
      expect(props.setShowKeyInput).toHaveBeenCalledWith(true);
    });

    it('opens the help modal', () => {
      const props = renderSection();
      fireEvent.click(screen.getByRole('button', { name: /Help/i }));
      expect(props.setShowHelpModal).toHaveBeenCalledWith(true);
    });
  });

  describe('expanded (input shown)', () => {
    it('renders a masked password input holding the current key', () => {
      renderSection({ showKeyInput: true, apiKey: 'gsk_abc' });
      const input = screen.getByPlaceholderText('Enter Groq API Key');
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveValue('gsk_abc');
    });

    it('forwards every edit to setApiKey, including clearing it', () => {
      const props = renderSection({ showKeyInput: true, apiKey: 'gsk_abc' });
      const input = screen.getByPlaceholderText('Enter Groq API Key');

      fireEvent.change(input, { target: { value: 'gsk_new' } });
      expect(props.setApiKey).toHaveBeenLastCalledWith('gsk_new');

      fireEvent.change(input, { target: { value: '' } });
      expect(props.setApiKey).toHaveBeenLastCalledWith('');
    });

    it('hides the cancel button while the key is empty, so the user cannot collapse to a keyless state', () => {
      renderSection({ showKeyInput: true, apiKey: '' });
      expect(screen.queryByTitle('Cancel editing')).not.toBeInTheDocument();
    });

    it('collapses the input when cancel is clicked with a key present', () => {
      const props = renderSection({ showKeyInput: true, apiKey: 'gsk_abc' });
      fireEvent.click(screen.getByTitle('Cancel editing'));
      expect(props.setShowKeyInput).toHaveBeenCalledWith(false);
    });

    it('still offers help while editing', () => {
      const props = renderSection({ showKeyInput: true });
      fireEvent.click(screen.getByTitle('Help with API Key'));
      expect(props.setShowHelpModal).toHaveBeenCalledWith(true);
    });
  });
});
