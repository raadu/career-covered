import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSave = vi.fn();
const mockDoc = { save: mockSave };
const mockRender = vi.fn(() => mockDoc);
const mockGetPdfDesign = vi.fn((_id: string) => ({
  id: 'classic-professional',
  render: mockRender,
}));

vi.mock('utils/pdfDesigns', () => ({
  DEFAULT_PDF_DESIGN_ID: 'classic-professional',
  getPdfDesign: (id: string) => mockGetPdfDesign(id),
}));

import { generatePdf } from '../downloadUtils';

describe('generatePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockReturnValue(mockDoc);
  });

  it('defaults to the classic-professional design id on a 2-arg call (backward compatibility)', () => {
    generatePdf('Dear Hiring Manager...', 'Cover_Letter');
    expect(mockGetPdfDesign).toHaveBeenCalledWith('classic-professional');
  });

  it('uses the given design id when a 3rd argument is provided', () => {
    generatePdf('Dear Hiring Manager...', 'Cover_Letter', 'creative-bold');
    expect(mockGetPdfDesign).toHaveBeenCalledWith('creative-bold');
  });

  it('renders the given text and saves with the given file name', () => {
    generatePdf('My letter text', 'My_File');
    expect(mockRender).toHaveBeenCalledWith('My letter text');
    expect(mockSave).toHaveBeenCalledWith('My_File.pdf');
  });
});
