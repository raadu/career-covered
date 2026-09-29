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

    it('splits the row 70/30 between the key and Help buttons on phones, and flattens into the parent grid on tablets', () => {
      renderSection();
      const keyButton = screen.getByRole('button', { name: /Add Custom API Key/i });
      const helpButton = screen.getByRole('button', { name: /Help/i });
      const row = keyButton.parentElement!;

      expect(row).toHaveClass('grid', 'grid-cols-[7fr_3fr]', 'w-full', 'md:contents', 'lg:flex');
      expect(row.children[0]).toBe(keyButton);
      expect(row.children[1]).toBe(helpButton);

      // Tablet: first and third thirds of row 1 (the model select is 2nd).
      expect(keyButton).toHaveClass('md:order-1', 'md:col-span-2', 'lg:order-none');
      expect(helpButton).toHaveClass('md:order-3', 'md:col-span-2', 'lg:order-none');
    });

    it('spans the whole first tablet row while the key input is open', () => {
      renderSection({ showKeyInput: true, apiKey: 'gsk_abc' });
      const input = screen.getByPlaceholderText('Enter Groq API Key');
      const wrapper = input.closest('.md\\:col-span-6');
      expect(wrapper).toHaveClass('md:order-1', 'lg:order-none');
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
