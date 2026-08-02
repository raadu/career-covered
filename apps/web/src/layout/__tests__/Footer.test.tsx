import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders credits correctly', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Made with/i)).toBeInTheDocument();
    expect(screen.getByText(/Raad/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Raad/i })).toHaveAttribute(
      'href',
      'https://raadu.github.io',
    );
  });
});
