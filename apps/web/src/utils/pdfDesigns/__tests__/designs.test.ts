import { describe, it, expect, vi } from 'vitest';
import { jsPDF } from 'jspdf';
import { PDF_DESIGNS, getPdfDesign } from '../index';
import type { PdfDesignId } from '../types';

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function buildSampleLetter(wordCount: number): string {
  const words = Array.from({ length: wordCount }, (_, i) => `word${i % 50}`);
  return words.join(' ');
}

const REPRESENTATIVE_LETTER = buildSampleLetter(350);
const COLOR_METHODS = ['setFillColor', 'setDrawColor', 'setTextColor'] as const;
const NON_CLASSIC_DESIGNS = PDF_DESIGNS.filter(
  (d) => d.id !== 'classic-professional',
);

describe('PDF_DESIGNS registry', () => {
  it.each(PDF_DESIGNS)(
    '$name renders without throwing and draws into the given doc',
    (design) => {
      const doc = new jsPDF();
      const result = design.render(REPRESENTATIVE_LETTER, doc);
      expect(result).toBe(doc);
    },
  );

  it.each(PDF_DESIGNS)(
    '$name passes the input text through to splitTextToSize unmodified',
    (design) => {
      const doc = new jsPDF();
      const spy = vi.spyOn(doc, 'splitTextToSize');
      design.render(REPRESENTATIVE_LETTER, doc);
      expect(spy).toHaveBeenCalledWith(
        REPRESENTATIVE_LETTER,
        expect.any(Number),
      );
    },
  );

  it.each(NON_CLASSIC_DESIGNS)(
    '$name uses its declared accentColor in at least one decoration call',
    (design) => {
      const doc = new jsPDF();
      const expectedRgb = hexToRgb(design.accentColor);
      const spies = COLOR_METHODS.map((method) => vi.spyOn(doc, method));

      design.render(REPRESENTATIVE_LETTER, doc);

      const usedExpectedColor = spies.some((spy) =>
        spy.mock.calls.some(
          (call) =>
            call[0] === expectedRgb[0] &&
            call[1] === expectedRgb[1] &&
            call[2] === expectedRgb[2],
        ),
      );
      expect(usedExpectedColor).toBe(true);
    },
  );

  it('getPdfDesign falls back to the default design for an unknown id', () => {
    const design = getPdfDesign('not-a-real-design' as PdfDesignId);
    expect(design.id).toBe('classic-professional');
  });

  it('getPdfDesign returns the exact matching design for a known id', () => {
    const design = getPdfDesign('technical-monospace');
    expect(design.id).toBe('technical-monospace');
  });
});

describe('classic-professional — backward-compatibility call surface', () => {
  it('never calls any color/shape drawing method (only setFont, setFontSize, splitTextToSize, text, addPage)', () => {
    const doc = new jsPDF();
    const disallowedMethods = [
      'setFillColor',
      'setDrawColor',
      'setTextColor',
      'setLineWidth',
      'rect',
      'line',
    ] as const;
    const spies = disallowedMethods.map((method) => vi.spyOn(doc, method));

    getPdfDesign('classic-professional').render(REPRESENTATIVE_LETTER, doc);

    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe('Page budget — a normal-length letter stays on one page', () => {
  it.each(PDF_DESIGNS)(
    '$name keeps a ~350-word letter to a single page',
    (design) => {
      const doc = design.render(REPRESENTATIVE_LETTER);
      expect(doc.getNumberOfPages()).toBe(1);
    },
  );
});

describe('Page budget — pagination safety net for unusually long content', () => {
  const LONG_LETTER = buildSampleLetter(2000);

  it('classic-professional paginates correctly for a very long letter', () => {
    const doc = getPdfDesign('classic-professional').render(LONG_LETTER);
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });

  it('elegant-sidebar paginates correctly across multiple pages without throwing', () => {
    const design = getPdfDesign('elegant-sidebar');
    expect(() => design.render(LONG_LETTER)).not.toThrow();
    const doc = design.render(LONG_LETTER);
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });
});

describe('Edge cases', () => {
  it.each(PDF_DESIGNS)(
    '$name handles empty string input without throwing',
    (design) => {
      expect(() => design.render('')).not.toThrow();
    },
  );

  it.each(PDF_DESIGNS)(
    '$name handles a single unbroken long word without throwing',
    (design) => {
      const longWord = 'a'.repeat(500);
      expect(() => design.render(longWord)).not.toThrow();
    },
  );

  it.each(PDF_DESIGNS)(
    '$name handles unicode/accented/emoji characters without throwing',
    (design) => {
      const text = 'Café Résumé — 你好 🎉 naïve façade';
      expect(() => design.render(text)).not.toThrow();
    },
  );
});
