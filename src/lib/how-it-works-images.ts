import manifestData from "@/data/how-it-works-images.json";

// Ensure manifest is always an array (handle webpack edge cases)
const manifest = Array.isArray(manifestData) ? manifestData : [];

export type HowItWorksImage = (typeof manifest)[number];

const manifestMap = new Map(manifest.map((entry) => [entry.slug, entry]));

export function getHowItWorksImage(slug: string): HowItWorksImage | undefined {
  return manifestMap.get(slug);
}

export function getHowItWorksImageOrFallback(
  slug: string,
  fallbackPath: string,
  fallbackAlt: string
) {
  const image = getHowItWorksImage(slug);
  if (!image) {
    return {
      imageUrl: fallbackPath,
      imageAlt: fallbackAlt,
      photographer: undefined,
      originalUrl: undefined,
    };
  }

  return {
    imageUrl: image.localPath,
    imageAlt: image.alt || fallbackAlt,
    photographer: image.photographer,
    originalUrl: image.originalUrl,
  };
}

export const howItWorksImageManifest = manifest;

