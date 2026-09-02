import type { PdfDesign, PdfDesignId } from './types';
import { renderClassicProfessional } from './classicProfessional';
import { renderModernMinimal } from './modernMinimal';
import { renderExecutiveFormal } from './executiveFormal';
import { renderCreativeBold } from './creativeBold';
import { renderTechnicalMonospace } from './technicalMonospace';
import { renderElegantSidebar } from './elegantSidebar';
import { renderFramedLetterhead } from './framedLetterhead';
import { renderCorporateDuotone } from './corporateDuotone';
import { renderGeometricAccent } from './geometricAccent';

export type { PdfDesign, PdfDesignId } from './types';

export const DEFAULT_PDF_DESIGN_ID: PdfDesignId = 'classic-professional';

const CLASSIC_PROFESSIONAL_DESIGN: PdfDesign = {
  id: 'classic-professional',
  name: 'Classic',
  description:
    'Plain black text on white background. No decoration.',
  recommendedFor: 'Great for all types of job applications. ATS Friendly.',
  accentColor: '#111827',
  swatchStyle: 'plain',
  render: renderClassicProfessional,
};

export const PDF_DESIGNS: PdfDesign[] = [
  CLASSIC_PROFESSIONAL_DESIGN,
  {
    id: 'modern-minimal',
    name: 'Minimal',
    description: 'Clean minimal layout with thin colored bar on the top.',
    recommendedFor: 'Great for tech, startups and product roles.',
    accentColor: '#2563EB',
    swatchStyle: 'topBar',
    render: renderModernMinimal,
  },
  {
    id: 'elegant-sidebar',
    name: 'Elegant',
    description:
      'A full-height dark sidebar column paired with a refined serif body.',
    recommendedFor:
      'Great for designers and architects wanting a portfolio look.',
    accentColor: '#0F172A',
    swatchStyle: 'fullSidebar',
    render: renderElegantSidebar,
  },
  {
    id: 'corporate-duotone',
    name: 'Corporate',
    description:
      'A two-tone stacked header in shades of black and gray.',
    recommendedFor:
      'Great for sales, business development and marketing roles.',
    accentColor: '#1F2937',
    swatchStyle: 'twoTone',
    render: renderCorporateDuotone,
  },
  {
    id: 'creative-bold',
    name: 'Creative',
    description: 'A bold colored header band makes a strong first impression.',
    recommendedFor: 'Great for UI/UX designers and creative/marketing roles.',
    accentColor: '#7C3AED',
    swatchStyle: 'header',
    render: renderCreativeBold,
  },
  {
    id: 'executive-formal',
    name: 'Executive',
    description:
      'Traditional serif letterhead style with a formal rule border.',
    recommendedFor: 'Great for legal, finance, architects and senior roles.',
    accentColor: '#3C3C3C',
    swatchStyle: 'rules',
    render: renderExecutiveFormal,
  },
  {
    id: 'technical-monospace',
    name: 'Techy',
    description: 'Monospace type with a terminal-inspired accent bar.',
    recommendedFor:
      'Great for software developers, network engineers and DevOps roles.',
    accentColor: '#10B981',
    swatchStyle: 'leftBar',
    render: renderTechnicalMonospace,
  },
  {
    id: 'framed-letterhead',
    name: 'Letterhead',
    description:
      'A refined double-rule border frames the entire page.',
    recommendedFor:
      'Great for consulting, banking and senior corporate roles.',
    accentColor: '#881337',
    swatchStyle: 'frame',
    render: renderFramedLetterhead,
  },
  {
    id: 'geometric-accent',
    name: 'Geometric',
    description:
      'A diagonal corner wedge adds a modern, on-trend geometric touch.',
    recommendedFor: 'Great for startups, product and brand marketing roles.',
    accentColor: '#F97316',
    swatchStyle: 'cornerAccent',
    render: renderGeometricAccent,
  },
];

export function getPdfDesign(id: PdfDesignId): PdfDesign {
  return (
    PDF_DESIGNS.find((design) => design.id === id) ??
    CLASSIC_PROFESSIONAL_DESIGN
  );
}
