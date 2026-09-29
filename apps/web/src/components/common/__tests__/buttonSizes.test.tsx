import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  CONTROL_HEIGHT,
  ICON_BUTTON_SIZE,
  TEXT_BUTTON_HEIGHT,
} from '../buttonSizes';
import {
  cardActionButtonClass,
  tableActionButtonClass,
} from '../DataTable/tableColumnMeta';
import CommonButton from '../CommonButton';
import Modal from '../Modal';
import ViewModeToggle from '../ViewModeToggle';
import Pagination from '../DataTable/Pagination';
import ModelSelect from 'components/GeneratorControls/ModelSelect';
import TemplateSelector from 'components/TemplateSelector';

const MOUSE_34 = '[@media(pointer:fine)]:';

describe('shared control sizes', () => {
  it('keep 40px for touch and drop to 34px only for mouse devices', () => {
    expect(TEXT_BUTTON_HEIGHT).toBe(`min-h-10 ${MOUSE_34}min-h-[34px]`);
    expect(ICON_BUTTON_SIZE).toContain('min-h-10 min-w-10');
    expect(ICON_BUTTON_SIZE).toContain(`${MOUSE_34}min-h-[34px]`);
    expect(ICON_BUTTON_SIZE).toContain(`${MOUSE_34}min-w-[34px]`);
    expect(CONTROL_HEIGHT).toBe(`h-10 ${MOUSE_34}h-[34px]`);
  });

  it('are used by the table and card action buttons', () => {
    expect(tableActionButtonClass).toContain(ICON_BUTTON_SIZE);
    expect(cardActionButtonClass).toContain(TEXT_BUTTON_HEIGHT);
    expect(cardActionButtonClass).not.toContain('min-w-10');
  });

  it('size text buttons, selects and chips to the same mouse height', () => {
    render(
      <>
        <CommonButton>Save</CommonButton>
        <ModelSelect selectedModel="openai/gpt-oss-120b" onChange={vi.fn()} />
        <TemplateSelector
          templates={[{ id: 't', name: 'Backend', content: 'x' }]}
          activeId={null}
          onSelect={vi.fn()}
          onRename={vi.fn()}
          onRemove={vi.fn()}
        />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      `${MOUSE_34}min-h-[34px]`,
    );
    expect(screen.getByLabelText('AI Model')).toHaveClass(
      'h-10',
      `${MOUSE_34}h-[34px]`,
    );
    // 32px icon buttons + the chip's 1px top/bottom border = 34px.
    expect(screen.getByTitle('Rename Template')).toHaveClass(
      'min-h-10',
      `${MOUSE_34}min-h-8`,
    );
  });

  it('size the view toggle and pagination numbers to match', () => {
    render(
      <>
        <ViewModeToggle viewMode="grid" onChange={vi.fn()} />
        <Pagination
          pageCount={3}
          pageIndex={0}
          pageSize={10}
          total={25}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          pageSizeOptions={[10]}
        />
      </>,
    );
    expect(screen.getByTitle('Grid View').parentElement).toHaveClass(
      'h-9',
      `${MOUSE_34}h-[34px]`,
    );
    expect(screen.getByRole('button', { name: '2' })).toHaveClass(
      `${MOUSE_34}min-h-[34px]`,
      `${MOUSE_34}min-w-[34px]`,
    );
    expect(screen.getByRole('button', { name: /Next/ })).toHaveClass(
      `${MOUSE_34}min-h-[34px]`,
    );
  });

  it('shrink the modal close button but keep the 14px title spacing via header padding', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Sign in">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass(
      `${MOUSE_34}min-h-[34px]`,
    );
    const header = screen.getByRole('heading', { name: 'Sign in' })
      .parentElement!.parentElement!;
    // 40px + 2×6px = 34px + 2×9px = 52px on both input types.
    expect(header).toHaveClass('py-1.5', `${MOUSE_34}py-[9px]`);
  });
});
