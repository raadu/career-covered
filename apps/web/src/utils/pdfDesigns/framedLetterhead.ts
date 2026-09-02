import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [136, 19, 55]; // rose-900
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const OUTER_INSET_MM = 8;
const INNER_INSET_MM = 10;

function drawFrame(doc: jsPDF): void {
  doc.setDrawColor(...ACCENT_RGB);
  doc.setLineWidth(0.6);
  doc.rect(
    OUTER_INSET_MM,
    OUTER_INSET_MM,
    PAGE_WIDTH_MM - OUTER_INSET_MM * 2,
    PAGE_HEIGHT_MM - OUTER_INSET_MM * 2,
  );
  doc.setLineWidth(0.3);
  doc.rect(
    INNER_INSET_MM,
    INNER_INSET_MM,
    PAGE_WIDTH_MM - INNER_INSET_MM * 2,
    PAGE_HEIGHT_MM - INNER_INSET_MM * 2,
  );
}

export function renderFramedLetterhead(
  text: string,
  doc = new jsPDF(),
): jsPDF {
  flowBodyText(doc, text, {
    marginX: 18,
    pageWidth: 174,
    startY: 26,
    pageHeightLimit: 278,
    lineSpacing: 7,
    onPageStart: (d) => drawFrame(d),
  });

  return doc;
}
