import { renderWithProviders, screen, fireEvent } from '../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import TemplateInput from '../TemplateInput';

describe('TemplateInput', () => {
    it('renders the label and textarea', () => {
        renderWithProviders(<TemplateInput />);
        expect(screen.getByText(/Your Cover Letter Template/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Paste your existing cover letter here/i)).toBeInTheDocument();
    });

    it('updates the state when the user types', () => {
        const { store } = renderWithProviders(<TemplateInput />);
        const textarea = screen.getByPlaceholderText(/Paste your existing cover letter here/i) as HTMLTextAreaElement;
        
        fireEvent.change(textarea, { target: { value: 'My resume details' } });
        
        expect(store.getState().coverLetter.template).toBe('My resume details');
    });

    it('handles malicious code input safely', () => {
        const maliciousPayload = '<img src=x onerror=alert(1)>';
        const { store } = renderWithProviders(<TemplateInput />);
        const textarea = screen.getByPlaceholderText(/Paste your existing cover letter here/i);
        
        fireEvent.change(textarea, { target: { value: maliciousPayload } });
        
        expect(store.getState().coverLetter.template).toBe(maliciousPayload);
        expect(textarea).toHaveValue(maliciousPayload);
    });
});
