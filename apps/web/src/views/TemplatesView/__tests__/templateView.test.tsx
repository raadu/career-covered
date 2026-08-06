import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  renderWithProviders,
  waitFor,
} from '../../../../tests/test-utils';
import Checkbox from 'views/TemplatesView/Checkbox';
import BatchActionBar from 'views/TemplatesView/BatchActionBar';
import TemplateTable from 'views/TemplatesView/TemplateTable';
import TemplatesView from 'views/TemplatesView/index';
import type { Template } from 'views/TemplatesView/types';

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Dev',
    content: 'Backend',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
  },
  {
    id: '2',
    name: 'Design',
    content: 'Figma',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-04',
  },
  {
    id: '3',
    name: 'PM',
    content: 'Jira',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-06',
  },
];

const emptyProps = {
  data: [] as Template[],
  totalPages: 0,
  page: 1,
  pageSize: 10,
  total: 0,
  isLoading: false,
  selectedIds: new Set<string>(),
  allSelected: false,
  someSelected: false,
  onToggleSelectAll: vi.fn(),
  onToggleSelect: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

const withDataProps = {
  ...emptyProps,
  data: mockTemplates,
  total: 3,
  totalPages: 1,
};

/* ============================================================
 * Checkbox
 * ============================================================ */
describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} />);
    const input = screen.getByRole('checkbox');
    expect(input).not.toBeChecked();
  });

  it('renders checked', () => {
    render(<Checkbox checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('sets indeterminate via ref when indeterminate is true', () => {
    const { container } = render(
      <Checkbox checked={false} indeterminate={true} onChange={vi.fn()} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it('does not set indeterminate when indeterminate is false', () => {
    const { container } = render(
      <Checkbox checked={false} indeterminate={false} onChange={vi.fn()} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });

  it('does not set indeterminate when indeterminate is undefined', () => {
    const { container } = render(
      <Checkbox checked={false} onChange={vi.fn()} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });

  it('renders with a label linked by id', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} id="my-check" />);
    const label = screen.getByLabelText('');
    expect(label).toBeDefined();
  });
});

/* ============================================================
 * BatchActionBar
 * ============================================================ */
describe('BatchActionBar', () => {
  it('renders selected count', () => {
    render(
      <BatchActionBar selectedCount={3} onDelete={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('renders singular count', () => {
    render(
      <BatchActionBar selectedCount={1} onDelete={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(
      <BatchActionBar
        selectedCount={2}
        onDelete={onDelete}
        onClear={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Delete Selected'));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    render(
      <BatchActionBar selectedCount={2} onDelete={vi.fn()} onClear={onClear} />,
    );
    fireEvent.click(screen.getByText('Clear selection'));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

/* ============================================================
 * TemplateTable (pure component tests)
 * ============================================================ */
describe('TemplateTable', () => {
  it('renders empty message when no data', () => {
    render(<TemplateTable {...emptyProps} />);
    expect(
      screen.getByText('No templates yet. Create one to get started.'),
    ).toBeInTheDocument();
  });

  it('renders rows with template data', () => {
    render(<TemplateTable {...withDataProps} />);
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('PM')).toBeInTheDocument();
  });

  it('renders select-all checkbox in header', () => {
    render(<TemplateTable {...withDataProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(4); // 1 header + 3 rows
  });

  it('calls onToggleSelectAll when header checkbox clicked', () => {
    const onToggleSelectAll = vi.fn();
    render(
      <TemplateTable
        {...withDataProps}
        onToggleSelectAll={onToggleSelectAll}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onToggleSelectAll).toHaveBeenCalledOnce();
  });

  it('calls onToggleSelect when row checkbox clicked', () => {
    const onToggleSelect = vi.fn();
    render(
      <TemplateTable {...withDataProps} onToggleSelect={onToggleSelect} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // first row
    expect(onToggleSelect).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when content cell is clicked', () => {
    const onEdit = vi.fn();
    render(<TemplateTable {...withDataProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Backend'));
    expect(onEdit).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<TemplateTable {...withDataProps} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByTitle('Delete Template');
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(
      <TemplateTable {...withDataProps} isLoading={true} />,
    );
    const skeletonDivs = container.querySelectorAll('.animate-pulse');
    expect(skeletonDivs.length).toBeGreaterThan(0);
  });

  it('renders Last Updated column with formatted date', () => {
    render(<TemplateTable {...withDataProps} />);
    expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 4, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 6, 2024')).toBeInTheDocument();
  });

  it('shows indeterminate state on header checkbox when someSelected is true and allSelected is false', () => {
    const { container } = render(
      <TemplateTable
        {...withDataProps}
        someSelected={true}
        allSelected={false}
      />,
    );
    const checkbox = container.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it('does not show indeterminate when allSelected is true', () => {
    const { container } = render(
      <TemplateTable
        {...withDataProps}
        someSelected={true}
        allSelected={true}
      />,
    );
    const checkbox = container.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(false);
  });
});

/* ============================================================
 * Selection logic (integration via TemplatesView)
 * ============================================================ */
describe('TemplatesView — selection logic', () => {
  const mockPaginatedResponse = {
    data: mockTemplates,
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPaginatedResponse),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders header with correct template count', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Cover Letter Templates')).toBeInTheDocument();
    });
    expect(screen.getByText('You have 3 templates')).toBeInTheDocument();
  });

  it('renders all template rows after fetch', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('PM')).toBeInTheDocument();
  });

  it('does not show batch action bar initially', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    });
  });

  it('shows batch action bar when a row checkbox is clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // first row

    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });

  it('selects all when header checkbox is clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // header

    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });
  });

  it('clears selection when Clear selection is clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // select first row
    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear selection'));
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('deselects all when header checkbox is clicked twice', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const checkboxes = () => screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes()[0]); // select all
    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });

    fireEvent.click(checkboxes()[0]); // deselect all
    await waitFor(() => {
      expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    });
  });

  it('shows batch delete confirm modal when Delete Selected is clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // select all

    await waitFor(() => {
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete Selected'));

    expect(screen.getByText('Delete 3 templates')).toBeInTheDocument();
    expect(screen.getByText('Delete All')).toBeInTheDocument();
  });
});

/* ============================================================
 * CRUD integration
 * ============================================================ */
describe('TemplatesView — CRUD operations', () => {
  const mockPaginatedResponse = {
    data: mockTemplates,
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPaginatedResponse),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens create modal when New Template is clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Template'));
    expect(screen.getByText('Add a New Template')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit Template');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit Template')).toBeInTheDocument();
  });

  it('shows single delete confirm when delete button clicked', async () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Template');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete template')).toBeInTheDocument();
  });

  it('sends batch delete request when batch delete is confirmed', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPaginatedResponse),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Dev')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // select all

    await waitFor(() => {
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete Selected'));

    await waitFor(() => {
      expect(screen.getByText('Delete All')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete All'));

    await waitFor(() => {
      const batchCall = mockFetch.mock.calls.find(
        (call) =>
          call[0] === '/api/templates/batch' && call[1]?.method === 'DELETE',
      );
      expect(batchCall).toBeDefined();
    });
  });
});

/* ============================================================
 * Edge cases
 * ============================================================ */
describe('TemplatesView — edge cases', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows empty message when no templates returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          }),
      }),
    );

    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(
        screen.getByText('No templates yet. Create one to get started.'),
      ).toBeInTheDocument();
    });
  });

  it('shows singular "template" when total is 1', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [mockTemplates[0]],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          }),
      }),
    );

    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('You have 1 template')).toBeInTheDocument();
    });
  });

  it('shows error toast on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Cover Letter Templates')).toBeInTheDocument();
    });
  });

  it('redirects to home when not authenticated', () => {
    renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
    });
    expect(
      screen.queryByText('Cover Letter Templates'),
    ).not.toBeInTheDocument();
  });

  it('returns null while auth is loading', () => {
    const { container } = renderWithProviders(<TemplatesView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: true } },
    });
    expect(container.innerHTML).toBe('');
  });
});
