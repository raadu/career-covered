import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [37, 99, 235]; // blue-600
const PAGE_WIDTH_MM = 210;
const BAR_HEIGHT_MM = 3;

function drawTopBar(doc: jsPDF): void {
  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, PAGE_WIDTH_MM, BAR_HEIGHT_MM, 'F');
}

export function renderModernMinimal(text: string, doc = new jsPDF()): jsPDF {
  flowBodyText(doc, text, {
    marginX: 16,
    pageWidth: 174,
    startY: 24,
    pageHeightLimit: 280,
    lineSpacing: 7,
    onPageStart: (d) => drawTopBar(d),
  });

  return doc;
}
