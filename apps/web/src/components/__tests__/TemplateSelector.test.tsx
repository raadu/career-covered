import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateSelector from '../TemplateSelector';
import type { SavedTemplate } from 'store/coverLetterSlice';

const makeTpl = (id: string, name: string, content: string): SavedTemplate => ({
  id, name, content,
});

const tplA = makeTpl('a', 'Template A', 'Content A');
const tplB = makeTpl('b', 'Template B', 'Content B');

describe('TemplateSelector', () => {
  it('returns null when no templates', () => {
    const { container } = render(
      <TemplateSelector
        templates={[]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders template boxes for each template', () => {
    render(
      <TemplateSelector
        templates={[tplA, tplB]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Template A')).toBeInTheDocument();
    expect(screen.getByText('Template B')).toBeInTheDocument();
  });

  it('calls onSelect when a template box is clicked', () => {
    const onSelect = vi.fn();
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={onSelect}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Template A'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('does not call onSelect when clicking edit button', () => {
    const onSelect = vi.fn();
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={onSelect}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle('Rename Template'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('enters edit mode on pencil click and commits rename on Enter', () => {
    const onRename = vi.fn();
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={onRename}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Rename Template'));

    const input = screen.getByDisplayValue('Template A');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRename).toHaveBeenCalledWith('a', 'New Name');
  });

  it('cancels rename on Escape and restores original name', () => {
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Rename Template'));

    const input = screen.getByDisplayValue('Template A');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.getByText('Template A')).toBeInTheDocument();
  });

  it('commits rename on blur', () => {
    const onRename = vi.fn();
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={onRename}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Rename Template'));

    const input = screen.getByDisplayValue('Template A');
    fireEvent.change(input, { target: { value: 'Blur Rename' } });
    fireEvent.blur(input);

    expect(onRename).toHaveBeenCalledWith('a', 'Blur Rename');
  });

  it('does not commit rename when new name is whitespace', () => {
    const onRename = vi.fn();
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={onRename}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Rename Template'));

    const input = screen.getByDisplayValue('Template A');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRename).not.toHaveBeenCalled();
  });

  it('calls onRemove when delete button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <TemplateSelector
        templates={[tplA, tplB]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={onRemove}
      />,
    );

    const deleteButtons = screen.getAllByTitle('Delete Template');
    fireEvent.click(deleteButtons[0]);

    expect(onRemove).toHaveBeenCalledWith('a');
  });

  it('applies active class to the selected template', () => {
    render(
      <TemplateSelector
        templates={[tplA, tplB]}
        activeId="a"
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const boxes = screen.getAllByText(/Template/);
    expect(boxes[0].parentElement).toHaveClass('bg-blue-50/80');
    expect(boxes[1].parentElement).not.toHaveClass('bg-blue-50/80');
  });

  it('does not apply active class when activeId is null', () => {
    render(
      <TemplateSelector
        templates={[tplA, tplB]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const boxes = screen.getAllByText(/Template/);
    boxes.forEach((box) => {
      expect(box.parentElement).not.toHaveClass('bg-blue-50/80');
    });
  });

  it('shows check icon and hides pencil in edit mode', () => {
    render(
      <TemplateSelector
        templates={[tplA]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Rename Template'));

    expect(screen.queryByTitle('Rename Template')).not.toBeInTheDocument();
    const checkBtn = document.querySelector('.text-green-500');
    expect(checkBtn).toBeInTheDocument();
  });

  it('renders with horizontal scroll', () => {
    render(
      <TemplateSelector
        templates={[tplA, tplB]}
        activeId={null}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const container = screen.getByText('Template A').parentElement!.parentElement!;
    expect(container.className).toContain('overflow-x-auto');
    expect(container.className).toContain('no-scrollbar');
  });
});
