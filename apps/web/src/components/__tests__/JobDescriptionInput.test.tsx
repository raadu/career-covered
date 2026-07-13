import { renderWithProviders, screen, fireEvent } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import JobDescriptionInput from '../JobDescriptionInput';

describe('JobDescriptionInput', () => {
    it('renders the label and textarea', () => {
        renderWithProviders(<JobDescriptionInput />);
        expect(screen.getByText(/Job Description/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Paste the job requirements here/i)).toBeInTheDocument();
    });

    it('updates the state when the user types', () => {
        const { store } = renderWithProviders(<JobDescriptionInput />);
        const textarea = screen.getByPlaceholderText(/Paste the job requirements here/i);
        
        fireEvent.change(textarea, { target: { value: 'New job desc' } });
        
        expect(store.getState().coverLetter.jobDescription).toBe('New job desc');
    });

    it('handles malicious code input safely (standard React escaping)', () => {
        const maliciousPayload = '<script>alert("xss")</script>';
        const { store } = renderWithProviders(<JobDescriptionInput />);
        const textarea = screen.getByPlaceholderText(/Paste the job requirements here/i);
        
        fireEvent.change(textarea, { target: { value: maliciousPayload } });
        
        // State should contain the payload exactly
        expect(store.getState().coverLetter.jobDescription).toBe(maliciousPayload);
        // Textarea should display it literally (safely)
        expect(textarea).toHaveValue(maliciousPayload);
    });
});
