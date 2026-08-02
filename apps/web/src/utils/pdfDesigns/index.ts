import type { PdfDesign, PdfDesignId } from './types';
import { renderClassicProfessional } from './classicProfessional';
import { renderModernMinimal } from './modernMinimal';
import { renderExecutiveFormal } from './executiveFormal';
import { renderCreativeBold } from './creativeBold';
import { renderTechnicalMonospace } from './technicalMonospace';
import { renderElegantSidebar } from './elegantSidebar';

export type { PdfDesign, PdfDesignId } from './types';

export const DEFAULT_PDF_DESIGN_ID: PdfDesignId = 'classic-professional';

const CLASSIC_PROFESSIONAL_DESIGN: PdfDesign = {
  id: 'classic-professional',
  name: 'Classic Professional',
  description:
    'Plain black text, no decoration — the safest, most ATS-friendly option.',
  recommendedFor: 'Great for most roles and ATS-heavy applications',
  accentColor: '#111827',
  swatchStyle: 'plain',
  render: renderClassicProfessional,
};

export const PDF_DESIGNS: PdfDesign[] = [
  CLASSIC_PROFESSIONAL_DESIGN,
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description:
      'Clean layout with a thin colored accent bar and airy spacing.',
    recommendedFor: 'Great for tech, startups, and product roles',
    accentColor: '#2563EB',
    swatchStyle: 'topBar',
    render: renderModernMinimal,
  },
  {
    id: 'executive-formal',
    name: 'Executive Formal',
    description:
      'Traditional serif letterhead style with a formal rule border.',
    recommendedFor: 'Great for architects, legal/finance, and senior roles',
    accentColor: '#3C3C3C',
    swatchStyle: 'rules',
    render: renderExecutiveFormal,
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'A bold colored header band makes a strong first impression.',
    recommendedFor: 'Great for UI/UX designers and creative/marketing roles',
    accentColor: '#7C3AED',
    swatchStyle: 'header',
    render: renderCreativeBold,
  },
  {
    id: 'technical-monospace',
    name: 'Technical Monospace',
    description: 'Monospace type with a terminal-inspired accent bar.',
    recommendedFor: 'Great for software engineers and DevOps roles',
    accentColor: '#10B981',
    swatchStyle: 'leftBar',
    render: renderTechnicalMonospace,
  },
  {
    id: 'elegant-sidebar',
    name: 'Elegant Sidebar',
    description:
      'A full-height dark sidebar column paired with a refined serif body.',
    recommendedFor:
      'Great for designers and architects wanting a portfolio look',
    accentColor: '#0F172A',
    swatchStyle: 'fullSidebar',
    render: renderElegantSidebar,
  },
];

export function getPdfDesign(id: PdfDesignId): PdfDesign {
  return (
    PDF_DESIGNS.find((design) => design.id === id) ??
    CLASSIC_PROFESSIONAL_DESIGN
  );
}
