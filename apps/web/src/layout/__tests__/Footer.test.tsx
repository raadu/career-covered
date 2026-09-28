import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders credits correctly', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Made with/i)).toBeInTheDocument();
    expect(screen.getByText(/Raiyad/i)).toBeInTheDocument();
    expect(screen.queryByText(/\bRaad\b/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Raiyad/i })).toHaveAttribute(
      'href',
      'https://raadu.github.io',
    );
  });

  it('is 40px on desktop to match the sidebar toggle, 48px below lg', () => {
    renderWithProviders(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('h-12', 'lg:h-10');
  });
});
