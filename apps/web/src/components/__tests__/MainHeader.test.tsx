import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainHeader from '../MainHeader';

describe('MainHeader', () => {
  it('renders the header title', () => {
    render(<MainHeader />);
    expect(
      screen.getByText(/Create Free Cover Letters in 2 Seconds/i),
    ).toBeInTheDocument();
  });

  it('leaves 2px above the headline on phones only', () => {
    render(<MainHeader />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('-mt-2', 'pt-0.5', 'md:pt-0');
  });

  it('renders the description text', () => {
    render(<MainHeader />);
    expect(
      screen.getByText(/Paste your cover letter template/i),
    ).toBeInTheDocument();
  });
});
