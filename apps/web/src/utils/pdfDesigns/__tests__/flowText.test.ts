import { describe, it, expect, vi } from 'vitest';
import type { jsPDF } from 'jspdf';
import { flowBodyText } from '../flowText';

function createFakeDoc(lines: string[]) {
  return {
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    splitTextToSize: vi.fn(() => lines),
    text: vi.fn(),
    addPage: vi.fn(),
  };
}

describe('flowBodyText', () => {
  it('draws all lines on one page when content fits within pageHeightLimit', () => {
    const fake = createFakeDoc(['line1', 'line2', 'line3']);

    flowBodyText(fake as unknown as jsPDF, 'irrelevant', {
      marginX: 15,
      pageWidth: 180,
      startY: 20,
      pageHeightLimit: 280,
      lineSpacing: 7,
    });

    expect(fake.addPage).not.toHaveBeenCalled();
    expect(fake.text).toHaveBeenCalledTimes(3);
    expect(fake.text).toHaveBeenNthCalledWith(1, 'line1', 15, 20);
    expect(fake.text).toHaveBeenNthCalledWith(2, 'line2', 15, 27);
    expect(fake.text).toHaveBeenNthCalledWith(3, 'line3', 15, 34);
  });

  it('calls onPageStart once for page 1 before any text is drawn', () => {
    const fake = createFakeDoc(['line1']);
    const onPageStart = vi.fn();

    flowBodyText(fake as unknown as jsPDF, 'x', {
      marginX: 15,
      pageWidth: 180,
      startY: 20,
      pageHeightLimit: 280,
      lineSpacing: 7,
      onPageStart,
    });

    expect(onPageStart).toHaveBeenCalledTimes(1);
    expect(onPageStart).toHaveBeenCalledWith(fake, 0);
    expect(onPageStart.mock.invocationCallOrder[0]).toBeLessThan(
      fake.text.mock.invocationCallOrder[0],
    );
  });

  it('breaks to a new page and calls onPageStart again when content exceeds pageHeightLimit', () => {
    const fake = createFakeDoc(['line1', 'line2']);
    const onPageStart = vi.fn();

    flowBodyText(fake as unknown as jsPDF, 'x', {
      marginX: 15,
      pageWidth: 180,
      startY: 10,
      pageHeightLimit: 15,
      lineSpacing: 10,
      onPageStart,
    });

    // line1 drawn at y=10 (<= 15); currentY becomes 20, which exceeds 15
    // before line2 is drawn, so a page break must occur.
    expect(fake.addPage).toHaveBeenCalledTimes(1);
    expect(onPageStart).toHaveBeenCalledTimes(2);
    expect(onPageStart).toHaveBeenNthCalledWith(1, fake, 0);
    expect(onPageStart).toHaveBeenNthCalledWith(2, fake, 1);
  });

  it('resumes at continuationStartY after a page break, distinct from the page-1 startY', () => {
    const fake = createFakeDoc(['line1', 'line2']);

    flowBodyText(fake as unknown as jsPDF, 'x', {
      marginX: 15,
      pageWidth: 180,
      startY: 26,
      continuationStartY: 20,
      pageHeightLimit: 30,
      lineSpacing: 10,
    });

    expect(fake.text).toHaveBeenNthCalledWith(1, 'line1', 15, 26);
    expect(fake.addPage).toHaveBeenCalledTimes(1);
    expect(fake.text).toHaveBeenNthCalledWith(2, 'line2', 15, 20);
  });

  it('re-applies the body font/size after onPageStart, so decoration cannot corrupt body text styling', () => {
    const fake = createFakeDoc(['line1', 'line2']);
    const onPageStart = vi.fn(() => {
      fake.setFont('helvetica', 'bold');
      fake.setFontSize(20);
    });

    flowBodyText(fake as unknown as jsPDF, 'x', {
      marginX: 15,
      pageWidth: 180,
      startY: 10,
      pageHeightLimit: 15,
      lineSpacing: 10,
      font: { family: 'times', style: 'normal', size: 11 },
      onPageStart,
    });

    expect(fake.setFont.mock.calls.at(-1)).toEqual(['times', 'normal']);
    expect(fake.setFontSize.mock.calls.at(-1)).toEqual([11]);
  });

  it('only calls setTextColor when textColor is explicitly provided', () => {
    const fake = createFakeDoc(['line1']);

    flowBodyText(fake as unknown as jsPDF, 'x', {
      marginX: 15,
      pageWidth: 180,
      startY: 20,
      pageHeightLimit: 280,
      lineSpacing: 7,
    });

    expect(fake.setTextColor).not.toHaveBeenCalled();
  });

  it('calls setTextColor with the given color when textColor is provided', () => {
    const fake = createFakeDoc(['line1']);

    flowBodyText(fake as unknown as jsPDF, 'x', {
      marginX: 15,
      pageWidth: 180,
      startY: 20,
      pageHeightLimit: 280,
      lineSpacing: 7,
      textColor: [10, 20, 30],
    });

    expect(fake.setTextColor).toHaveBeenCalledWith(10, 20, 30);
  });

  it('passes the input text and pageWidth to splitTextToSize', () => {
    const fake = createFakeDoc(['a']);

    flowBodyText(fake as unknown as jsPDF, 'the quick brown fox', {
      marginX: 15,
      pageWidth: 174,
      startY: 20,
      pageHeightLimit: 280,
      lineSpacing: 7,
    });

    expect(fake.splitTextToSize).toHaveBeenCalledWith(
      'the quick brown fox',
      174,
    );
  });
});
