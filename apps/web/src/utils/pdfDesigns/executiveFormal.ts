import { jsPDF } from 'jspdf';
import { flowBodyText } from './flowText';

const RULE_RGB: [number, number, number] = [60, 60, 60];
const RULE_X_START = 18;
const RULE_X_END = 192;
const BOTTOM_RULE_Y = 286;

function drawRules(doc: jsPDF): void {
  doc.setDrawColor(...RULE_RGB);
  doc.setLineWidth(0.4);
  doc.line(RULE_X_START, 14, RULE_X_END, 14);
  doc.setLineWidth(0.2);
  doc.line(RULE_X_START, 16, RULE_X_END, 16);
  doc.setLineWidth(0.2);
  doc.line(RULE_X_START, BOTTOM_RULE_Y, RULE_X_END, BOTTOM_RULE_Y);
}

export function renderExecutiveFormal(text: string, doc = new jsPDF()): jsPDF {
  flowBodyText(doc, text, {
    marginX: 18,
    pageWidth: 174,
    startY: 24,
    pageHeightLimit: 278,
    lineSpacing: 7,
    font: { family: 'times', style: 'normal' },
    onPageStart: (d) => drawRules(d),
  });

  return doc;
}
