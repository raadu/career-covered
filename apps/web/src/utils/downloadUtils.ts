import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import {
  DEFAULT_PDF_DESIGN_ID,
  getPdfDesign,
  type PdfDesignId,
} from 'utils/pdfDesigns';

export function generatePdf(
  text: string,
  fileName: string,
  designId: PdfDesignId = DEFAULT_PDF_DESIGN_ID,
): void {
  const doc = getPdfDesign(designId).render(text);
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
