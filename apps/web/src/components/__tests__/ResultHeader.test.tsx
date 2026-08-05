import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultHeader from '../ResultDisplay/ResultHeader';

describe('ResultHeader', () => {
  const defaultProps = {
    isDownloading: null as 'pdf' | 'word' | null,
    handleOpenDesigns: vi.fn(),
    handleDownloadPDF: vi.fn(),
    handleDownloadWord: vi.fn(),
    handleCopy: vi.fn(),
    copied: false,
  };

  it('renders the heading', () => {
    render(<ResultHeader {...defaultProps} />);
    expect(screen.getByText('Generated Cover Letter')).toBeInTheDocument();
  });

  it('renders Designs, PDF, Word, and Copy buttons', () => {
    render(<ResultHeader {...defaultProps} />);
    expect(screen.getByText('Designs')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Word')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('calls handleOpenDesigns when Designs button is clicked', () => {
    render(<ResultHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('Designs'));
    expect(defaultProps.handleOpenDesigns).toHaveBeenCalledOnce();
  });

  it('calls handleDownloadPDF when PDF button is clicked', () => {
    render(<ResultHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('PDF'));
    expect(defaultProps.handleDownloadPDF).toHaveBeenCalledOnce();
  });

  it('calls handleDownloadWord when Word button is clicked', () => {
    render(<ResultHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('Word'));
    expect(defaultProps.handleDownloadWord).toHaveBeenCalledOnce();
  });

  it('calls handleCopy when Copy button is clicked', () => {
    render(<ResultHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(defaultProps.handleCopy).toHaveBeenCalledOnce();
  });

  it('disables Designs, PDF, and Word buttons while downloading PDF', () => {
    render(<ResultHeader {...defaultProps} isDownloading="pdf" />);
    const buttons = screen.getAllByRole('button');
    // Designs, PDF, and Word disabled, Copy is not disabled
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
    expect(buttons[3]).not.toBeDisabled();
  });

  it('shows "Copied!" when copied is true', () => {
    render(<ResultHeader {...defaultProps} copied={true} />);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });
});
