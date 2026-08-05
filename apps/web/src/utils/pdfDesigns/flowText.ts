import type { jsPDF } from 'jspdf';

export interface FlowTextFont {
  family: string;
  style: string;
  size?: number;
}

export interface FlowTextOptions {
  marginX: number;
  pageWidth: number;
  startY: number;
  /** Y position to resume at after a page break; defaults to `startY`. */
  continuationStartY?: number;
  pageHeightLimit: number;
  lineSpacing: number;
  font?: FlowTextFont;
  /** Body text color; defaults to black. Re-applied after every onPageStart
   * call so a design's decoration (e.g. a white label) can't leak into the
   * body text's color. */
  textColor?: [number, number, number];
  /**
   * Called once for page 1 (pageIndex 0) and again immediately after every
   * internal addPage() (pageIndex 1, 2, ...), always before any text is
   * drawn on that page. Designs use this single hook for both page-1-only
   * decoration (guard on `pageIndex === 0`) and every-page decoration.
   * Body font/size/color are re-applied right after this callback runs, so
   * decoration is free to change font/color without affecting body text.
   */
  onPageStart?: (doc: jsPDF, pageIndex: number) => void;
}

export function flowBodyText(
  doc: jsPDF,
  text: string,
  opts: FlowTextOptions,
): void {
  const font = opts.font ?? { family: 'helvetica', style: 'normal' };
  const fontSize = font.size ?? 11;
  const [r, g, b] = opts.textColor ?? [0, 0, 0];

  const applyBodyFont = () => {
    doc.setFont(font.family, font.style);
    doc.setFontSize(fontSize);
    if (opts.textColor) {
      doc.setTextColor(r, g, b);
    }
  };

  // The active font/size affects how splitTextToSize measures line widths,
  // so the body font must be applied before wrapping.
  applyBodyFont();
  const lines: string[] = doc.splitTextToSize(text, opts.pageWidth);

  const continuationStartY = opts.continuationStartY ?? opts.startY;
  let currentY = opts.startY;
  let pageIndex = 0;

  opts.onPageStart?.(doc, pageIndex);
  applyBodyFont();

  lines.forEach((line) => {
    if (currentY > opts.pageHeightLimit) {
      doc.addPage();
      pageIndex += 1;
      opts.onPageStart?.(doc, pageIndex);
      applyBodyFont();
      currentY = continuationStartY;
    }
    doc.text(line, opts.marginX, currentY);
    currentY += opts.lineSpacing;
  });
}
