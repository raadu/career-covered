import type { jsPDF } from 'jspdf';

export type PdfDesignId =
  | 'classic-professional'
  | 'modern-minimal'
  | 'executive-formal'
  | 'creative-bold'
  | 'technical-monospace'
  | 'elegant-sidebar';

/** Drives the lightweight preview swatch shown in the Designs picker modal —
 * a simplified mockup of the design's real layout, not a pixel-accurate
 * rendering of the generated PDF. */
export type PdfDesignSwatchStyle =
  'plain' | 'topBar' | 'rules' | 'header' | 'leftBar' | 'fullSidebar';

export interface PdfDesign {
  id: PdfDesignId;
  name: string;
  description: string;
  recommendedFor: string;
  accentColor: string;
  swatchStyle: PdfDesignSwatchStyle;
  /**
   * `doc` is optional and defaults to a new jsPDF instance — production code
   * never passes it. It exists purely so tests can inject a real jsPDF
   * instance and spy on its own methods (jsPDF assigns its API as instance
   * properties, not prototype methods, so spying only works this way).
   */
  render: (text: string, doc?: jsPDF) => jsPDF;
}
