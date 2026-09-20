import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Rename template">
        <p>Body</p>
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Rename template')).not.toBeInTheDocument();
  });

  it('renders the title, body, and optional footer when open', () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Rename template"
        footer={<button type="button">Save</button>}
      >
        <p>Template name</p>
      </Modal>,
    );
    expect(screen.getByText('Rename template')).toBeInTheDocument();
    expect(screen.getByText('Template name')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders no footer region when the footer prop is omitted', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Rename template">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('is portaled to document.body, not the render container', () => {
    const { container } = render(
      <Modal isOpen onClose={vi.fn()} title="Rename template">
        <p>Body</p>
      </Modal>,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Rename template">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the overlay is clicked, but not when the dialog card is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Rename template">
        <p>Body</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders an optional header icon badge', () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Rename template"
        icon={<span data-testid="header-icon" />}
      >
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByTestId('header-icon')).toBeInTheDocument();
  });
});
