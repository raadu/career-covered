import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [15, 23, 42]; // slate-900
const SIDEBAR_WIDTH_MM = 18;
const PAGE_HEIGHT_MM = 297;
const RIGHT_MARGIN_MM = 15;
const GUTTER_MM = 12;

function drawSidebar(doc: jsPDF): void {
  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, SIDEBAR_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
}

export function renderElegantSidebar(text: string, doc = new jsPDF()): jsPDF {
  const marginX = SIDEBAR_WIDTH_MM + GUTTER_MM;

  flowBodyText(doc, text, {
    marginX,
    pageWidth: 210 - marginX - RIGHT_MARGIN_MM,
    startY: 24,
    pageHeightLimit: 280,
    lineSpacing: 7,
    font: { family: 'times', style: 'normal' },
    onPageStart: (d) => drawSidebar(d),
  });

  return doc;
}
