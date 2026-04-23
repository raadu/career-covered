import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApiHelpModal from '../Modals/ApiHelpModal';
import PrivacyModal from '../Modals/PrivacyModal';

describe('Informational Modals', () => {
    describe('ApiHelpModal', () => {
        it('renders when open', () => {
            render(<ApiHelpModal isOpen={true} onClose={vi.fn()} providerName="Groq" providerUrl="https://groq.com" />);
            // Updated to match actual heading in the implementation
            expect(screen.getByText(/How to get your API Key/i)).toBeInTheDocument();
        });

        it('does not render when closed', () => {
            const { container } = render(<ApiHelpModal isOpen={false} onClose={vi.fn()} providerName="Groq" providerUrl="https://groq.com" />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe('PrivacyModal', () => {
        it('renders when open', () => {
            render(<PrivacyModal isOpen={true} onClose={vi.fn()} />);
            // Updated to match actual heading "Data Privacy"
            expect(screen.getByText(/Data Privacy/i)).toBeInTheDocument();
        });

        it('does not render when closed', () => {
            const { container } = render(<PrivacyModal isOpen={false} onClose={vi.fn()} />);
            expect(container.firstChild).toBeNull();
        });
    });
});
