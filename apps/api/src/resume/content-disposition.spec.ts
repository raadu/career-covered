import { buildContentDisposition } from './content-disposition';

describe('buildContentDisposition', () => {
  it('builds an inline header with the given filename', () => {
    expect(buildContentDisposition('inline', 'resume.pdf')).toBe(
      'inline; filename="resume.pdf"',
    );
  });

  it('builds an attachment header with the given filename', () => {
    expect(buildContentDisposition('attachment', 'John_Doe_CV.pdf')).toBe(
      'attachment; filename="John_Doe_CV.pdf"',
    );
  });

  it('strips CRLF characters that would otherwise inject extra header fields', () => {
    const malicious = 'resume.pdf"\r\nSet-Cookie: session=stolen';
    const result = buildContentDisposition('attachment', malicious);
    // The CRLF is stripped so "Set-Cookie: ..." can never start a new header
    // line — it survives only as harmless literal text inside one filename
    // value, on a single line.
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
    expect(result.split('\n')).toHaveLength(1);
    expect(result).toBe(
      'attachment; filename="resume.pdfSet-Cookie: session=stolen"',
    );
  });

  it('strips double quotes so a filename cannot break out of the quoted value', () => {
    const malicious = 'evil.pdf"; filename="other.exe';
    const result = buildContentDisposition('attachment', malicious);
    // With quotes stripped, the whole thing collapses into one filename
    // value rather than terminating the first quoted string early.
    expect(result).toBe('attachment; filename="evil.pdf; filename=other.exe"');
    expect((result.match(/"/g) ?? []).length).toBe(2);
  });

  it('strips other control characters (e.g. NUL, DEL)', () => {
    const malicious = `resume\x00.pdf\x7f`;
    const result = buildContentDisposition('attachment', malicious);
    expect(result).toBe('attachment; filename="resume.pdf"');
  });

  it('trims surrounding whitespace', () => {
    expect(buildContentDisposition('inline', '  resume.pdf  ')).toBe(
      'inline; filename="resume.pdf"',
    );
  });

  it('falls back to resume.pdf when the filename is empty after sanitizing', () => {
    expect(buildContentDisposition('inline', '')).toBe(
      'inline; filename="resume.pdf"',
    );
  });

  it('falls back to resume.pdf when the filename is made entirely of control characters', () => {
    expect(buildContentDisposition('attachment', '\r\n\x00\x7f')).toBe(
      'attachment; filename="resume.pdf"',
    );
  });

  it('falls back to resume.pdf when the filename is whitespace-only', () => {
    expect(buildContentDisposition('inline', '   ')).toBe(
      'inline; filename="resume.pdf"',
    );
  });

  it('preserves unicode characters in the filename', () => {
    expect(buildContentDisposition('inline', 'résumé_José.pdf')).toBe(
      'inline; filename="résumé_José.pdf"',
    );
  });
});
