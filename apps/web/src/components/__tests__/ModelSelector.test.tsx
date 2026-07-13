import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModelSelector from '../ModelSelector';
import { AVAILABLE_MODELS } from 'utils/modelsInfoUtils';

describe('ModelSelector', () => {
    it('renders the select field with an accessible label', () => {
        render(<ModelSelector selectedModel={AVAILABLE_MODELS[0].id} onModelChange={vi.fn()} />);
        expect(screen.getByLabelText(/AI Model/i)).toBeInTheDocument();
    });

    it('renders all available models as options', () => {
        render(<ModelSelector selectedModel={AVAILABLE_MODELS[0].id} onModelChange={vi.fn()} />);
        AVAILABLE_MODELS.forEach(model => {
            expect(screen.getByText(model.name)).toBeInTheDocument();
        });
    });

    it('calls onModelChange with the new value when selection changes', () => {
        const onModelChange = vi.fn();
        render(<ModelSelector selectedModel={AVAILABLE_MODELS[0].id} onModelChange={onModelChange} />);
        
        const select = screen.getByLabelText(/AI Model/i);
        fireEvent.change(select, { target: { value: AVAILABLE_MODELS[1].id } });
        
        expect(onModelChange).toHaveBeenCalledWith(AVAILABLE_MODELS[1].id);
    });

    it('reflects the correct selected model', () => {
        render(<ModelSelector selectedModel={AVAILABLE_MODELS[1].id} onModelChange={vi.fn()} />);
        const select = screen.getByLabelText(/AI Model/i) as HTMLSelectElement;
        expect(select.value).toBe(AVAILABLE_MODELS[1].id);
    });
});
