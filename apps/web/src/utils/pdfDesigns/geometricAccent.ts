import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [249, 115, 22]; // orange-500
const PAGE_WIDTH_MM = 210;
const WEDGE_SIZE_MM = 35;

function drawCornerWedge(doc: jsPDF, pageIndex: number): void {
  if (pageIndex !== 0) return;

  doc.setFillColor(...ACCENT_RGB);
  doc.triangle(
    PAGE_WIDTH_MM - WEDGE_SIZE_MM,
    0,
    PAGE_WIDTH_MM,
    0,
    PAGE_WIDTH_MM,
    WEDGE_SIZE_MM,
    'F',
  );
}

export function renderGeometricAccent(text: string, doc = new jsPDF()): jsPDF {
  flowBodyText(doc, text, {
    marginX: 16,
    pageWidth: 178,
    startY: 26,
    continuationStartY: 20,
    pageHeightLimit: 280,
    lineSpacing: 7,
    onPageStart: (d, pageIndex) => drawCornerWedge(d, pageIndex),
  });

  return doc;
}
