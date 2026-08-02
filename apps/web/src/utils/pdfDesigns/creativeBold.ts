import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [124, 58, 237]; // violet-600
const PAGE_WIDTH_MM = 210;
const BAND_HEIGHT_MM = 18;

function drawHeaderBand(doc: jsPDF, pageIndex: number): void {
  if (pageIndex !== 0) return;

  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, PAGE_WIDTH_MM, BAND_HEIGHT_MM, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('COVER LETTER', 16, BAND_HEIGHT_MM / 2 + 4);
}

export function renderCreativeBold(text: string, doc = new jsPDF()): jsPDF {
  flowBodyText(doc, text, {
    marginX: 16,
    pageWidth: 178,
    startY: 26,
    continuationStartY: 20,
    pageHeightLimit: 280,
    lineSpacing: 7,
    textColor: [0, 0, 0],
    onPageStart: (d, pageIndex) => drawHeaderBand(d, pageIndex),
  });

  return doc;
}
