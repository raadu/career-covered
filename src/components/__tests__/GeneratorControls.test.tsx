import { renderWithProviders, screen } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import GeneratorControls from '../GeneratorControls';

describe('GeneratorControls', () => {
    it('renders sub-components correctly', () => {
        renderWithProviders(<GeneratorControls />);
        expect(screen.getByRole('button', { name: /Add Custom API Key/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Cover Letter/i })).toBeInTheDocument();
    });

    it('disables the generate button if job description is missing', () => {
        renderWithProviders(<GeneratorControls />, {
            preloadedState: {
                coverLetter: {
                    jobDescription: '',
                    apiKey: 'valid-key'
                }
            }
        });
        const button = screen.getByRole('button', { name: /Generate Cover Letter/i });
        expect(button).toBeDisabled();
    });

    it('enables the generate button if job description and API key are present', () => {
        renderWithProviders(<GeneratorControls />, {
            preloadedState: {
                coverLetter: {
                    jobDescription: 'Software Engineer',
                    apiKey: 'valid-key'
                }
            }
        });
        const button = screen.getByRole('button', { name: /Generate Cover Letter/i });
        expect(button).toBeEnabled();
    });

    it('enables the generate button if job description is present and using free generations (no key)', () => {
        renderWithProviders(<GeneratorControls />, {
            preloadedState: {
                coverLetter: {
                    jobDescription: 'Software Engineer',
                    apiKey: '',
                    generationCount: 1
                }
            }
        });
        const button = screen.getByRole('button', { name: /Generate Cover Letter/i });
        expect(button).toBeEnabled();
    });
});
