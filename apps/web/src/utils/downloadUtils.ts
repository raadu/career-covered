import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import {
  DEFAULT_PDF_DESIGN_ID,
  getPdfDesign,
  type PdfDesignId,
} from 'utils/pdfDesigns';

// jsPDF's standard fonts (helvetica/times/courier) only support WinAnsi
// encoding (Latin-1 plus a few special-cased symbols like the euro sign).
// LLM output routinely contains characters outside that range — smart
// typography (curly quotes, en/em dashes, ellipsis, bullets) and symbols
// (arrows, checkmarks, stars) that LLMs commonly use in achievement-style
// bullets. Confirmed via direct inspection of jsPDF's output: a single
// unsupported character (e.g. "→") doesn't just render as a missing glyph —
// it flips the *entire* surrounding line into a corrupted 2-byte encoding,
// visibly mangling the whole run of text (looks like mixed/wrong fonts) and
// throwing off width measurement (text overflowing the margin). Mapping the
// common cases to ASCII equivalents first, then dropping anything else
// outside WinAnsi, keeps a single bad character from wrecking the line.
const PDF_CHAR_REPLACEMENTS: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '‚': "'",
  '‛': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '‟': '"',
  '–': '-',
  '—': '-',
  '…': '...',
  '•': '-',
  '◦': '-',
  '▪': '-',
  '′': "'",
  '″': '"',
  '→': '->',
  '←': '<-',
  '↑': '^',
  '↓': 'v',
  '✓': 'v',
  '✔': 'v',
  '✗': 'x',
  '✘': 'x',
  '★': '*',
  '☆': '*',
  '™': '(TM)',
};
const PDF_MAPPED_CHARS = /[‘-‟–—…•◦▪′″←-↓✓✔✗✘★☆™]/g;

export function sanitizeForPdf(text: string): string {
  const mapped = text.replace(PDF_MAPPED_CHARS, (ch) => PDF_CHAR_REPLACEMENTS[ch]);
  // Anything left over is outside WinAnsi (aside from the euro sign, which
  // jsPDF handles as a special case) — drop it rather than risk corrupting
  // the rest of the line. Newlines/tabs are kept explicitly since they fall
  // below the printable range but are needed for paragraph breaks.
  return mapped.replace(/[^\n\r\t\x20-\xFF€]/g, '');
}

export function generatePdf(
  text: string,
  fileName: string,
  designId: PdfDesignId = DEFAULT_PDF_DESIGN_ID,
): void {
  const doc = getPdfDesign(designId).render(sanitizeForPdf(text));
  doc.save(`${fileName}.pdf`);
}

export async function generateWord(
  text: string,
  fileName: string,
): Promise<void> {
  const paragraphs = text.split('\n').map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: 'Arial',
            size: 24, // 12pt
          }),
        ],
        spacing: { after: 120 },
      }),
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}
