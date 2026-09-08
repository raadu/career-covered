import {
  renderWithProviders,
  screen,
  fireEvent,
} from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import FaqView from 'views/FaqView';

describe('FaqView', () => {
  it('renders the FAQ heading', () => {
    renderWithProviders(<FaqView />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders all 7 FAQ questions', () => {
    renderWithProviders(<FaqView />);
    expect(
      screen.getByText(/Do I need to login or signup/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Will I be charged with my credit card/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How many cover letters can I create for free/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/What is a Groq API key/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Can I customize the tone and style/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How do I export my cover letter/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/What templates can I use/i)).toBeInTheDocument();
  });

  it('opens first 5 questions by default', () => {
    renderWithProviders(<FaqView />);
    const buttons = screen.getAllByRole('button');
    const expanded = buttons.filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(expanded).toHaveLength(5);
  });

  it('has remaining 2 questions collapsed by default', () => {
    renderWithProviders(<FaqView />);
    const buttons = screen.getAllByRole('button');
    const collapsed = buttons.filter(
      (b) => b.getAttribute('aria-expanded') === 'false',
    );
    expect(collapsed).toHaveLength(2);
  });

  it('toggles a question open when clicked', () => {
    renderWithProviders(<FaqView />);
    const exportBtn = screen.getByText(/How do I export my cover letter/i);
    expect(exportBtn.closest('button')?.getAttribute('aria-expanded')).toBe(
      'false',
    );

    fireEvent.click(exportBtn);

    expect(exportBtn.closest('button')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(
      screen.getByText(/Click the Copy button to copy the text/i),
    ).toBeInTheDocument();
  });

  it('toggles a question closed when clicked', () => {
    renderWithProviders(<FaqView />);
    const firstBtn = screen.getByText(/Do I need to login or signup/i);
    expect(firstBtn.closest('button')?.getAttribute('aria-expanded')).toBe(
      'true',
    );

    fireEvent.click(firstBtn);

    expect(firstBtn.closest('button')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('renders a link to the Support page', () => {
    renderWithProviders(<FaqView />);
    const supportLink = screen.getByText('Get in touch');
    expect(supportLink).toBeInTheDocument();
    expect(supportLink.closest('a')).toHaveAttribute('href', '/support');
  });

  it('contains FAQPage schema markup', () => {
    const { container } = renderWithProviders(<FaqView />);
    const faqPageDiv = container.querySelector(
      '[itemType="https://schema.org/FAQPage"]',
    );
    expect(faqPageDiv).toBeInTheDocument();
  });
});
