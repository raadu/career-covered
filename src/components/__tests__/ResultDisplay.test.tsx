import { renderWithProviders, screen } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import ResultDisplay from '../ResultDisplay';

describe('ResultDisplay', () => {
    it('returns null if there is no generated letter', () => {
        const { container } = renderWithProviders(<ResultDisplay />, {
            preloadedState: {
                coverLetter: {
                    generatedLetter: ''
                }
            }
        });
        expect(container.firstChild).toBeNull();
    });

    it('renders the generated letter if present', () => {
        const testLetter = 'Dear Hiring Manager, this is my cover letter.';
        renderWithProviders(<ResultDisplay />, {
            preloadedState: {
                coverLetter: {
                    generatedLetter: testLetter
                }
            }
        });
        expect(screen.getByText(/Dear Hiring Manager/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Word/i })).toBeInTheDocument();
    });

    it('handles malicious content in the generated letter safely (it uses a textarea)', () => {
        const maliciousPayload = '<script>alert("xss")</script> **Bold Text**';
        renderWithProviders(<ResultDisplay />, {
            preloadedState: {
                coverLetter: {
                    generatedLetter: maliciousPayload
                }
            }
        });
        const editor = screen.getByDisplayValue(maliciousPayload);
        expect(editor).toBeInTheDocument();
        // Since it's in a textarea, it's rendered as plain text
        expect(screen.queryByTitle(/script/i)).not.toBeInTheDocument();
    });
});
