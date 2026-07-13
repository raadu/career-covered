import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GenerateAction from '../GeneratorControls/GenerateAction';

describe('GenerateAction', () => {
  const defaultProps = {
    isLoading: false,
    hasJobDescription: true,
    hasGeneratedLetter: false,
    onGenerate: vi.fn(),
  };

  it('renders "Generate Cover Letter" text initially', () => {
    render(<GenerateAction {...defaultProps} />);
    expect(screen.getByText('Generate Cover Letter')).toBeInTheDocument();
  });

  it('renders "Generate Another One" when hasGeneratedLetter is true', () => {
    render(<GenerateAction {...defaultProps} hasGeneratedLetter={true} />);
    expect(screen.getByText('Generate Another One')).toBeInTheDocument();
  });

  it('renders a button', () => {
    render(<GenerateAction {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disables button when isLoading is true', () => {
    render(<GenerateAction {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when hasJobDescription is false', () => {
    render(<GenerateAction {...defaultProps} hasJobDescription={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when both isLoading and no job description', () => {
    render(
      <GenerateAction
        {...defaultProps}
        isLoading={true}
        hasJobDescription={false}
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <GenerateAction
        {...defaultProps}
        error={{ status: 500, data: {} } as any}
      />,
    );
    expect(screen.getByText(/Error generating/i)).toBeInTheDocument();
  });

  it('does not show error message when error is undefined', () => {
    render(<GenerateAction {...defaultProps} />);
    expect(screen.queryByText(/Error generating/i)).not.toBeInTheDocument();
  });
});
