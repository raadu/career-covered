import { renderWithProviders, screen } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import SupportView from 'views/SupportView';

describe('SupportView', () => {
  it('renders the heading', () => {
    renderWithProviders(<SupportView />);
    expect(
      screen.getByText("I'm always here to help you!"),
    ).toBeInTheDocument();
  });

  it('renders a LinkedIn link', () => {
    renderWithProviders(<SupportView />);
    const linkedinLink = screen.getByText('Connect on LinkedIn');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.closest('a')?.getAttribute('href')).toContain(
      'linkedin.com',
    );
  });

  it('renders a Feedback form link', () => {
    renderWithProviders(<SupportView />);
    const feedbackLink = screen.getByText('Feedback Form');
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink.closest('a')?.getAttribute('href')).toContain(
      'google.com/forms',
    );
  });

  it('renders the divider text', () => {
    renderWithProviders(<SupportView />);
    expect(screen.getByText(/or help me improve/i)).toBeInTheDocument();
  });

  it('renders the "suggest new features" text', () => {
    renderWithProviders(<SupportView />);
    expect(
      screen.getByText(
        /You can also suggest new features and report bugs anonymously/i,
      ),
    ).toBeInTheDocument();
  });

  it('opens LinkedIn link in new tab', () => {
    renderWithProviders(<SupportView />);
    const linkedinLink = screen.getByText('Connect on LinkedIn').closest('a');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens Feedback form link in new tab', () => {
    renderWithProviders(<SupportView />);
    const feedbackLink = screen.getByText('Feedback Form').closest('a');
    expect(feedbackLink).toHaveAttribute('target', '_blank');
    expect(feedbackLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
