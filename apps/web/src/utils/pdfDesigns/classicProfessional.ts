import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

export function renderClassicProfessional(
  text: string,
  doc = new jsPDF(),
): jsPDF {
  flowBodyText(doc, text, {
    marginX: 15,
    pageWidth: 180,
    startY: 20,
    pageHeightLimit: 280,
    lineSpacing: 7,
  });

  return doc;
}
