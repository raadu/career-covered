import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [31, 41, 55]; // gray-800
const SECONDARY_RGB: [number, number, number] = [209, 213, 219]; // gray-300
const PAGE_WIDTH_MM = 210;
const PRIMARY_BAND_HEIGHT_MM = 12;
const SECONDARY_BAND_HEIGHT_MM = 6;

function drawDuotoneHeader(doc: jsPDF, pageIndex: number): void {
  if (pageIndex !== 0) return;

  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, PAGE_WIDTH_MM, PRIMARY_BAND_HEIGHT_MM, 'F');
  doc.setFillColor(...SECONDARY_RGB);
  doc.rect(
    0,
    PRIMARY_BAND_HEIGHT_MM,
    PAGE_WIDTH_MM,
    SECONDARY_BAND_HEIGHT_MM,
    'F',
  );
}

export function renderCorporateDuotone(
  text: string,
  doc = new jsPDF(),
): jsPDF {
  flowBodyText(doc, text, {
    marginX: 16,
    pageWidth: 178,
    startY: 26,
    continuationStartY: 20,
    pageHeightLimit: 280,
    lineSpacing: 7,
    onPageStart: (d, pageIndex) => drawDuotoneHeader(d, pageIndex),
  });

  return doc;
}
