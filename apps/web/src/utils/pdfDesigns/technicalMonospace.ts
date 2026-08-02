import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const ACCENT_RGB: [number, number, number] = [16, 185, 129]; // emerald-500
const BAR_WIDTH_MM = 3;
const PAGE_HEIGHT_MM = 297;

function drawSideBar(doc: jsPDF): void {
  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, BAR_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
}

export function renderTechnicalMonospace(
  text: string,
  doc = new jsPDF(),
): jsPDF {
  flowBodyText(doc, text, {
    marginX: 14,
    pageWidth: 178,
    startY: 22,
    pageHeightLimit: 280,
    lineSpacing: 6.2,
    font: { family: 'courier', style: 'normal', size: 10 },
    onPageStart: (d) => drawSideBar(d),
  });

  return doc;
}
