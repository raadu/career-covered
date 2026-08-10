import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  screen,
  fireEvent,
  waitFor,
  renderWithProviders,
} from '../../../../tests/test-utils';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import PreviousCoverLettersView from 'views/PreviousCoverLettersView/index';
import type { CoverLetterItem } from 'views/PreviousCoverLettersView/types';

vi.mock('jspdf', () => {
  // Stubs every jsPDF method used across the PDF designs (not just Classic),
  // since choosing any design in the picker now has to render for real here.
  class FakeJsPDF {
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    setDrawColor() {}
    setFillColor() {}
    setLineWidth() {}
    line() {}
    rect() {}
    addPage() {}
    text() {}
    splitTextToSize(text: string) {
      return [text];
    }
    save() {}
  }
  return {
    jsPDF: FakeJsPDF,
    default: FakeJsPDF,
  };
});

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

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
];

const mockPaginatedResponse = {
  data: mockItems,
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('PreviousCoverLettersView — downloads', () => {
  const saveSpy = vi.spyOn(jsPDF.prototype, 'save');
  const saveAsMock = vi.mocked(saveAs);

  beforeEach(() => {
    saveSpy.mockClear();
    saveAsMock.mockClear();
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

  const renderWithUser = (name: string | null) =>
    renderWithProviders(<PreviousCoverLettersView />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          isLoading: false,
          user:
            name === null
              ? null
              : { id: 'u1', email: 'user@example.com', name },
        },
      },
    });

  it('names the PDF file using the user full name', async () => {
    renderWithUser('Helena Mann Dzousa');
    await waitFor(() => {
      expect(screen.getByTitle('Choose a PDF design')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Choose a PDF design')[0]);
    fireEvent.click(screen.getByText('Classic'));
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        'Cover_Letter_Helena_Mann_Dzousa.pdf',
      );
    });
  });

  it('names the Word file using the user full name', async () => {
    renderWithUser('John Smith');
    await waitFor(() => {
      expect(screen.getByTitle('Download as Word')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Download as Word')[0]);
    await waitFor(() => {
      expect(saveAsMock).toHaveBeenCalledWith(
        expect.any(Blob),
        'Cover_Letter_John_Smith.docx',
      );
    });
  });

  it('falls back to Cover_Letter.pdf when user name is blank', async () => {
    renderWithUser('');
    await waitFor(() => {
      expect(screen.getByTitle('Choose a PDF design')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Choose a PDF design')[0]);
    fireEvent.click(screen.getByText('Classic'));
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith('Cover_Letter.pdf');
    });
  });

  it('falls back to Cover_Letter.docx when user is null', async () => {
    renderWithUser(null);
    await waitFor(() => {
      expect(screen.getByTitle('Download as Word')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Download as Word')[0]);
    await waitFor(() => {
      expect(saveAsMock).toHaveBeenCalledWith(
        expect.any(Blob),
        'Cover_Letter.docx',
      );
    });
  });

  it('separates every word of a four-word name in the PDF file name', async () => {
    renderWithUser('Mary Jane Watson Parker');
    await waitFor(() => {
      expect(screen.getByTitle('Choose a PDF design')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Choose a PDF design')[0]);
    fireEvent.click(screen.getByText('Classic'));
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        'Cover_Letter_Mary_Jane_Watson_Parker.pdf',
      );
    });
  });

  it('opens the design picker instead of downloading immediately', async () => {
    renderWithUser('Helena Mann Dzousa');
    await waitFor(() => {
      expect(screen.getByTitle('Choose a PDF design')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Choose a PDF design')[0]);

    expect(screen.getByText('Choose a PDF Design')).toBeInTheDocument();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('downloads the PDF in whichever design is chosen from the picker', async () => {
    renderWithUser('Helena Mann Dzousa');
    await waitFor(() => {
      expect(screen.getByTitle('Choose a PDF design')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Choose a PDF design')[0]);
    fireEvent.click(screen.getByText('Executive'));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        'Cover_Letter_Helena_Mann_Dzousa.pdf',
      );
    });
    await waitFor(() => {
      expect(screen.queryByText('Choose a PDF Design')).not.toBeInTheDocument();
    });
  });

  it('closes the design picker without downloading when dismissed', async () => {
    renderWithUser('Helena Mann Dzousa');
    await waitFor(() => {
      expect(screen.getByTitle('Choose a PDF design')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByTitle('Choose a PDF design')[0]);
    expect(screen.getByText('Choose a PDF Design')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close modal'));

    expect(screen.queryByText('Choose a PDF Design')).not.toBeInTheDocument();
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
