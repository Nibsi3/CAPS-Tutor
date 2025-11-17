import type { NormalizedExtraction, NormalizedLine, PyMuPDFExtraction } from './types';

const HEADER_PATTERNS = [
  /national senior certificate/i,
  /department of education/i,
  /copyright/i,
  /page\s+\d+/i,
];

const FOOTER_PATTERNS = [/please turn over/i, /copyright/i];

const HYPHENATED_WORD = /([a-zA-Z]{2,})-$/;

function shouldDropLine(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return true;
  return (
    HEADER_PATTERNS.some((pattern) => pattern.test(normalized)) ||
    FOOTER_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function cleanLineText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function expandBlockToLines(blockText: string): string[] {
  return blockText
    .split(/\r?\n/)
    .map((line) => cleanLineText(line))
    .filter((line) => line.length > 0 && !shouldDropLine(line));
}

export function normalizeExtraction(extraction: PyMuPDFExtraction): NormalizedExtraction {
  const pages = extraction.pages.map((page, pageIndex) => {
    const lines: NormalizedLine[] = [];

    page.text_blocks.forEach((block, blockIndex) => {
      const blockLines = expandBlockToLines(block.text);
      blockLines.forEach((text) => {
        lines.push({
          text,
          page: page.page ?? pageIndex,
          y0: block.bbox[1],
          y1: block.bbox[3],
          blockIndex,
        });
      });
    });

    // merge hyphenated endings between adjacent lines from the same block
    for (let i = 0; i < lines.length - 1; i++) {
      const current = lines[i];
      const next = lines[i + 1];
      const hyphenMatch = current.text.match(HYPHENATED_WORD);
      if (hyphenMatch && current.blockIndex === next.blockIndex && current.page === next.page) {
        current.text = current.text.replace(HYPHENATED_WORD, '$1');
        next.text = next.text.replace(/^[\s-]+/, '');
      }
    }

    return {
      page: page.page ?? pageIndex,
      lines,
      images: page.images ?? [],
    };
  });

  return { pages };
}
