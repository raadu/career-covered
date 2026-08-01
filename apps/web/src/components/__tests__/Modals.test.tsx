import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PrivacyModal from '../Modals/PrivacyModal';

describe('PrivacyModal', () => {
  it('renders when open', () => {
    render(<PrivacyModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Data Privacy/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /There are no backend services or databases connected to this application/i,
      ),
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <PrivacyModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<PrivacyModal isOpen={true} onClose={onClose} />);
    const closeBtn = screen.getByText(/Got it/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
