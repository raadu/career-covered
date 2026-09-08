import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSave = vi.fn();
const mockDoc = { save: mockSave };
const mockRender = vi.fn(() => mockDoc);
const mockGetPdfDesign = vi.fn((id: string) => ({
  id,
  render: mockRender,
}));

vi.mock('utils/pdfDesigns', () => ({
  DEFAULT_PDF_DESIGN_ID: 'classic-professional',
  getPdfDesign: (id: string) => mockGetPdfDesign(id),
}));

import { generatePdf, sanitizeForPdf } from '../downloadUtils';

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

  it('sanitizes smart typography before rendering', () => {
    generatePdf('“Dear” Sir—Madam… it’s a pleasure•', 'My_File');
    expect(mockRender).toHaveBeenCalledWith('"Dear" Sir-Madam... it\'s a pleasure-');
  });
});

describe('sanitizeForPdf', () => {
  it('normalizes curly quotes to straight quotes', () => {
    expect(sanitizeForPdf('‘hi’ “there”')).toBe(`'hi' "there"`);
  });

  it('normalizes en and em dashes to a hyphen', () => {
    expect(sanitizeForPdf('a–b c—d')).toBe('a-b c-d');
  });

  it('normalizes an ellipsis to three dots', () => {
    expect(sanitizeForPdf('wait…')).toBe('wait...');
  });

  it('normalizes a bullet to a hyphen', () => {
    expect(sanitizeForPdf('• item')).toBe('- item');
  });

  it('leaves plain ASCII text unchanged', () => {
    expect(sanitizeForPdf('Dear Hiring Manager, thanks!')).toBe(
      'Dear Hiring Manager, thanks!',
    );
  });

  it('normalizes arrows, checkmarks, and stars to ASCII', () => {
    expect(sanitizeForPdf('Growth → 40% ✓ Done ★ Great')).toBe(
      'Growth -> 40% v Done * Great',
    );
  });

  it('normalizes the trademark symbol', () => {
    expect(sanitizeForPdf('Acme™ Corp')).toBe('Acme(TM) Corp');
  });

  it('leaves Latin-1 characters (accents, euro, pound, degree, ®, ©) untouched', () => {
    expect(sanitizeForPdf('café résumé € 50,000 £100 98.6° ® ©')).toBe(
      'café résumé € 50,000 £100 98.6° ® ©',
    );
  });

  it('drops characters outside WinAnsi (CJK, emoji) instead of corrupting the line', () => {
    expect(sanitizeForPdf('Skills: 你好 🚀 React')).toBe('Skills:   React');
  });

  it('preserves paragraph breaks (newlines and tabs)', () => {
    expect(sanitizeForPdf('Line one\n\nLine two\tindented')).toBe(
      'Line one\n\nLine two\tindented',
    );
  });
});
