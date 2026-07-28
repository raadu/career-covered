import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Layout from '../Layout';

describe('Layout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 'test', email: 'test@test.com', name: 'Test' }),
        });
        vi.stubGlobal('fetch', mockFetch);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders children correctly', () => {
        renderWithProviders(
            <Layout>
                <div data-testid="child">Test Content</div>
            </Layout>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders sidebar and main content areas', () => {
        renderWithProviders(
            <Layout>
                <div>Content</div>
            </Layout>
        );
        // "Career Covered" is in SidebarHeader
        expect(screen.getByText(/Career Covered/i)).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('shows onboarding modal if no API key is present and generationCount is greater than 4', () => {
        renderWithProviders(
            <Layout>
                <div>Content</div>
            </Layout>,
            {
                preloadedState: {
                    coverLetter: {
                        apiKey: '',
                        generationCount: 5
                    }
                }
            }
        );
        // Heading in OnboardingModal
        expect(screen.getByText(/It’s so easy to start!/i)).toBeInTheDocument();
    });

    it('does not show onboarding modal if no API key is present but generationCount is 4 or less', () => {
        renderWithProviders(
            <Layout>
                <div>Content</div>
            </Layout>,
            {
                preloadedState: {
                    coverLetter: {
                        apiKey: '',
                        generationCount: 4
                    }
                }
            }
        );
        expect(screen.queryByText(/It’s so easy to start!/i)).not.toBeInTheDocument();
    });

    it('initializes sidebar state from localStorage', () => {
        localStorage.setItem('cl_sidebar_expanded', 'false');
        renderWithProviders(
            <Layout>
                <div>Content</div>
            </Layout>
        );
        
        // When collapsed, SidebarNavigation items have specific classes or hidden text.
        // We can check if the title "Career Covered" is visible or has opacity-0
        const title = screen.getByText(/Career Covered/i);
        expect(title).toHaveClass('opacity-0');
    });
});
