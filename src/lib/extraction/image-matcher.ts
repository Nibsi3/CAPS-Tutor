import type { NormalizedExtraction, QuestionMedia, QuestionToken } from './types';
import type { ExtractedImage } from '@/lib/pdf-pymupdf-extractor';

interface ImageIndexEntry {
  page: number;
  image: ExtractedImage;
}

function flattenImages(normalized: NormalizedExtraction): ImageIndexEntry[] {
  const entries: ImageIndexEntry[] = [];
  normalized.pages.forEach((page) => {
    page.images?.forEach((image) => {
      entries.push({ page: page.page, image });
    });
  });
  return entries;
}

function toMedia(image: ExtractedImage, page: number): QuestionMedia {
  return {
    filename: image.filename,
    page,
    bbox: image.bbox,
    width: image.width,
    height: image.height,
    label: (image as any).label,
    fileId: (image as any).fileId,
  };
}

export interface ImageMatchResult {
  media: Record<string, QuestionMedia>;
  findImageForToken: (token: QuestionToken) => QuestionMedia | undefined;
}

export function createImageMatcher(normalized: NormalizedExtraction): ImageMatchResult {
  const entries = flattenImages(normalized);
  const mediaMap: Record<string, QuestionMedia> = {};

  entries.forEach(({ page, image }) => {
    if (!image.filename) return;
    mediaMap[image.filename] = toMedia(image, page);
  });

  const findImageForToken = (token: QuestionToken): QuestionMedia | undefined => {
    const [start, end] = token.pageRange;
    const pages = new Set<number>([
      start - 1,
      start,
      end,
      end + 1,
    ]);
    const match = entries.find(({ page }) => pages.has(page));
    if (match && match.image.filename) {
      return mediaMap[match.image.filename];
    }
    return undefined;
  };

  return { media: mediaMap, findImageForToken };
}
