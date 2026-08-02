import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PdfDesignsModal from '../index';
import { PDF_DESIGNS } from 'utils/pdfDesigns';

describe('PdfDesignsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    downloadingDesignId: null,
    onSelectDesign: vi.fn(),
  };

  it('renders nothing when closed', () => {
    const { container } = render(
      <PdfDesignsModal {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all 6 design cards when open', () => {
    render(<PdfDesignsModal {...defaultProps} />);
    PDF_DESIGNS.forEach((design) => {
      expect(screen.getByText(design.name)).toBeInTheDocument();
    });
  });

  it('calls onSelectDesign with the clicked design id', () => {
    const onSelectDesign = vi.fn();
    render(
      <PdfDesignsModal {...defaultProps} onSelectDesign={onSelectDesign} />,
    );
    fireEvent.click(screen.getByText('Modern Minimal'));
    expect(onSelectDesign).toHaveBeenCalledOnce();
    expect(onSelectDesign).toHaveBeenCalledWith('modern-minimal');
  });

  it('disables all cards while a design is being generated', () => {
    render(
      <PdfDesignsModal
        {...defaultProps}
        downloadingDesignId="modern-minimal"
      />,
    );
    const cards = screen
      .getAllByRole('button')
      .filter((el) =>
        PDF_DESIGNS.some((d) => el.textContent?.includes(d.name)),
      );
    cards.forEach((card) => expect(card).toBeDisabled());
  });

  it('does not call onSelectDesign when clicking a disabled card', () => {
    const onSelectDesign = vi.fn();
    render(
      <PdfDesignsModal
        {...defaultProps}
        downloadingDesignId="modern-minimal"
        onSelectDesign={onSelectDesign}
      />,
    );
    fireEvent.click(screen.getByText('Executive Formal'));
    expect(onSelectDesign).not.toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<PdfDesignsModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <PdfDesignsModal {...defaultProps} onClose={onClose} />,
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when clicking inside the panel', () => {
    const onClose = vi.fn();
    render(<PdfDesignsModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Choose a PDF Design'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
