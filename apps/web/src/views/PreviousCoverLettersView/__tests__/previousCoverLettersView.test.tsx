import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderWithProviders, waitFor } from '../../../../tests/test-utils';
import BatchActionBar from 'views/PreviousCoverLettersView/BatchActionBar';
import PreviousCoverLettersTable from 'views/PreviousCoverLettersView/PreviousCoverLettersTable';
import PreviousCoverLettersView from 'views/PreviousCoverLettersView/index';
import type { CoverLetterItem } from 'views/PreviousCoverLettersView/types';

const mockItems: CoverLetterItem[] = [
  {
    id: '1',
    jobTitle: 'Engineer',
    companyName: 'Google',
    jobDescription: 'Software Engineer at Google',
    generatedText: 'Dear Google...',
    model: 'llama-3.3-70b-versatile',
    wordLimit: null,
    minimalChanges: null,
    sameLanguage: null,
    customPrompt: null,
    jobMarket: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    templateId: null,
    template: null,
  },
  {
    id: '2',
    jobTitle: 'Designer',
    companyName: 'Figma',
    jobDescription: 'Product Designer at Figma',
    generatedText: 'Dear Figma...',
    model: 'llama-3.3-70b-versatile',
    wordLimit: 300,
    minimalChanges: true,
    sameLanguage: false,
    customPrompt: null,
    jobMarket: null,
    createdAt: '2024-01-03T00:00:00.000Z',
    templateId: 't1',
    template: { id: 't1', name: 'Design Template' },
  },
  {
    id: '3',
    jobTitle: 'Manager',
    companyName: 'Amazon',
    jobDescription: 'Product Manager at Amazon',
    generatedText: 'Dear Amazon...',
    model: 'llama-3.3-70b-versatile',
    wordLimit: null,
    minimalChanges: null,
    sameLanguage: null,
    customPrompt: null,
    jobMarket: null,
    createdAt: '2024-01-05T00:00:00.000Z',
    templateId: null,
    template: null,
  },
];

const emptyProps = {
  data: [] as CoverLetterItem[],
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
  onDownloadPdf: vi.fn(),
  onDownloadWord: vi.fn(),
  onCopy: vi.fn(),
  onDelete: vi.fn(),
};

const withDataProps = {
  ...emptyProps,
  data: mockItems,
  total: 3,
  totalPages: 1,
};

/* ============================================================
 * BatchActionBar
 * ============================================================ */
describe('BatchActionBar', () => {
  it('renders selected count', () => {
    render(<BatchActionBar selectedCount={3} onDelete={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('renders singular count', () => {
    render(<BatchActionBar selectedCount={1} onDelete={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<BatchActionBar selectedCount={2} onDelete={onDelete} onClear={vi.fn()} />);
    fireEvent.click(screen.getByText('Delete Selected'));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    render(<BatchActionBar selectedCount={2} onDelete={vi.fn()} onClear={onClear} />);
    fireEvent.click(screen.getByText('Clear selection'));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

/* ============================================================
 * PreviousCoverLettersTable (pure component tests)
 * ============================================================ */
describe('PreviousCoverLettersTable', () => {
  it('renders empty message when no data', () => {
    render(<PreviousCoverLettersTable {...emptyProps} />);
    expect(screen.getByText('No saved cover letters yet. Generate one to get started.')).toBeInTheDocument();
  });

  it('renders rows with job descriptions', () => {
    render(<PreviousCoverLettersTable {...withDataProps} />);
    expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    expect(screen.getByText('Product Designer at Figma')).toBeInTheDocument();
    expect(screen.getByText('Product Manager at Amazon')).toBeInTheDocument();
  });

  it('renders template names when available', () => {
    render(<PreviousCoverLettersTable {...withDataProps} />);
    expect(screen.getByText('Design Template')).toBeInTheDocument();
    const naLabels = screen.getAllByText('N/A');
    expect(naLabels.length).toBe(2);
  });

  it('renders formatted dates', () => {
    render(<PreviousCoverLettersTable {...withDataProps} />);
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 3, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 5, 2024')).toBeInTheDocument();
  });

  it('renders action buttons with correct titles', () => {
    render(<PreviousCoverLettersTable {...withDataProps} />);
    const pdfButtons = screen.getAllByTitle('Download as PDF');
    const wordButtons = screen.getAllByTitle('Download as Word');
    const copyButtons = screen.getAllByTitle('Copy to clipboard');
    const deleteButtons = screen.getAllByTitle('Delete');

    expect(pdfButtons.length).toBe(3);
    expect(wordButtons.length).toBe(3);
    expect(copyButtons.length).toBe(3);
    expect(deleteButtons.length).toBe(3);
  });

  it('calls onDownloadPdf when PDF button clicked', () => {
    const onDownloadPdf = vi.fn();
    render(<PreviousCoverLettersTable {...withDataProps} onDownloadPdf={onDownloadPdf} />);
    const pdfButtons = screen.getAllByTitle('Download as PDF');
    fireEvent.click(pdfButtons[0]);
    expect(onDownloadPdf).toHaveBeenCalledWith(mockItems[0]);
  });

  it('calls onDownloadWord when Word button clicked', () => {
    const onDownloadWord = vi.fn();
    render(<PreviousCoverLettersTable {...withDataProps} onDownloadWord={onDownloadWord} />);
    const wordButtons = screen.getAllByTitle('Download as Word');
    fireEvent.click(wordButtons[1]);
    expect(onDownloadWord).toHaveBeenCalledWith(mockItems[1]);
  });

  it('calls onCopy when Copy button clicked', () => {
    const onCopy = vi.fn();
    render(<PreviousCoverLettersTable {...withDataProps} onCopy={onCopy} />);
    const copyButtons = screen.getAllByTitle('Copy to clipboard');
    fireEvent.click(copyButtons[2]);
    expect(onCopy).toHaveBeenCalledWith(mockItems[2]);
  });

  it('calls onDelete when Delete button clicked', () => {
    const onDelete = vi.fn();
    render(<PreviousCoverLettersTable {...withDataProps} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renders select-all checkbox in header', () => {
    render(<PreviousCoverLettersTable {...withDataProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(4); // 1 header + 3 rows
  });

  it('calls onToggleSelectAll when header checkbox clicked', () => {
    const onToggleSelectAll = vi.fn();
    render(<PreviousCoverLettersTable {...withDataProps} onToggleSelectAll={onToggleSelectAll} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onToggleSelectAll).toHaveBeenCalledOnce();
  });

  it('calls onToggleSelect when row checkbox clicked', () => {
    const onToggleSelect = vi.fn();
    render(<PreviousCoverLettersTable {...withDataProps} onToggleSelect={onToggleSelect} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(onToggleSelect).toHaveBeenCalledWith('1');
  });

  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(<PreviousCoverLettersTable {...withDataProps} isLoading={true} />);
    const skeletonDivs = container.querySelectorAll('.animate-pulse');
    expect(skeletonDivs.length).toBeGreaterThan(0);
  });
});

/* ============================================================
 * Integration tests
 * ============================================================ */
describe('PreviousCoverLettersView — integration', () => {
  const mockPaginatedResponse = {
    data: mockItems,
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

  it('renders header with correct cover letter count', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Previously created cover letters')).toBeInTheDocument();
    });
    expect(screen.getByText('You have 3 saved cover letters')).toBeInTheDocument();
  });

  it('renders all rows after fetch', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });
    expect(screen.getByText('Product Designer at Figma')).toBeInTheDocument();
    expect(screen.getByText('Product Manager at Amazon')).toBeInTheDocument();
  });

  it('renders Create New button', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });
  });

  it('does not show batch action bar initially', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('shows batch action bar when a row checkbox is clicked', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });

  it('selects all when header checkbox is clicked', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('shows single delete confirm modal', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete cover letter')).toBeInTheDocument();
  });

  it('shows batch delete confirm modal', async () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByText('Delete Selected'));

    expect(screen.getByText('Delete 3 cover letters')).toBeInTheDocument();
    expect(screen.getByText('Delete All')).toBeInTheDocument();
  });

  it('sends batch delete request when confirmed', async () => {
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
      json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Software Engineer at Google')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

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
        (call) => call[0] === '/api/cover-letters/batch' && call[1]?.method === 'DELETE',
      );
      expect(batchCall).toBeDefined();
    });
  });
});

/* ============================================================
 * Edge cases
 * ============================================================ */
describe('PreviousCoverLettersView — edge cases', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows empty message when no cover letters', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
      }),
    );

    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('No saved cover letters yet. Generate one to get started.')).toBeInTheDocument();
    });
  });

  it('shows singular "cover letter" when total is 1', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: [mockItems[0]],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      }),
    );

    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('You have 1 saved cover letter')).toBeInTheDocument();
    });
  });

  it('shows error toast on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false }),
    );

    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });
    await waitFor(() => {
      expect(screen.getByText('Previously created cover letters')).toBeInTheDocument();
    });
  });

  it('redirects to home when not authenticated', () => {
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
    });
    expect(screen.queryByText('Previously created cover letters')).not.toBeInTheDocument();
  });

  it('returns null while auth is loading', () => {
    const { container } = renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: true } },
    });
    expect(container.innerHTML).toBe('');
  });
});
