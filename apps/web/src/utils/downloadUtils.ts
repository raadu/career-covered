import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const PDF_PAGE_WIDTH = 180;
const PDF_MARGIN_X = 15;
const PDF_START_Y = 20;
const PDF_PAGE_HEIGHT_LIMIT = 280;
const PDF_LINE_SPACING = 7;

export function generatePdf(text: string, fileName: string): void {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const lines: string[] = doc.splitTextToSize(text, PDF_PAGE_WIDTH);
  let currentY = PDF_START_Y;

  lines.forEach((line) => {
    if (currentY > PDF_PAGE_HEIGHT_LIMIT) {
      doc.addPage();
      currentY = PDF_START_Y;
    }
    doc.text(line, PDF_MARGIN_X, currentY);
    currentY += PDF_LINE_SPACING;
  });

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
