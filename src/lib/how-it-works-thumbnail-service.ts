import 'server-only';

type Provider = 'unsplash' | 'pexels';

interface CachedThumbnail {
  url: string;
  provider: Provider;
  fetchedAt: number;
}

const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours
const thumbnailCache = new Map<string, CachedThumbnail>();

// Map each step to a unique Unsplash query to avoid redundancy
const stepQueries: Record<string, string> = {
  'intelligent-content': 'AI technology education learning artificial intelligence',
  'adaptive-learning': 'personalized learning student studying tablet computer',
  'ai-feedback': 'teacher student feedback education communication',
  'progress-tracking': 'analytics dashboard charts data visualization education',
  'caps-alignment': 'curriculum books South Africa education academic',
  'interactive-tutoring': 'online tutoring video call education support',
};

function buildQuery(slug: string): string {
  return stepQueries[slug] || 'education learning students';
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return null;
  }

  const apiUrl = new URL('https://api.unsplash.com/photos/random');
  apiUrl.searchParams.set('query', query);
  apiUrl.searchParams.set('orientation', 'landscape');
  apiUrl.searchParams.set('content_filter', 'high');
  apiUrl.searchParams.set('count', '1');

  const response = await fetch(apiUrl, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Unsplash request failed with status ${response.status}`);
  }

  const json = await response.json();
  const photo = Array.isArray(json) ? json[0] : json;
  const url: string | undefined =
    photo?.urls?.regular ||
    photo?.urls?.full ||
    photo?.urls?.raw ||
    photo?.urls?.small;

  return url ?? null;
}

function getCachedThumbnail(slug: string): CachedThumbnail | null {
  const cached = thumbnailCache.get(slug);
  if (!cached) {
    return null;
  }
  if (Date.now() - cached.fetchedAt > CACHE_TTL) {
    thumbnailCache.delete(slug);
    return null;
  }
  return cached;
}

export async function getThumbnailForHowItWorks(slug: string): Promise<string> {
  const cached = getCachedThumbnail(slug);
  if (cached) {
    return cached.url;
  }

  const query = buildQuery(slug);

  try {
    const unsplashUrl = await fetchUnsplashImage(query);
    if (unsplashUrl) {
      thumbnailCache.set(slug, {
        url: unsplashUrl,
        provider: 'unsplash',
        fetchedAt: Date.now(),
      });
      return unsplashUrl;
    }
  } catch (error) {
    console.warn(`Unsplash fetch failed for "${slug}" (${query}):`, (error as Error).message);
  }

  // Fallback to Pexels (using a generic education image)
  const fallback =
    'https://images.pexels.com/photos/3760851/pexels-photo-3760851.jpeg?auto=compress&cs=tinysrgb&w=2070&dpr=2';

  thumbnailCache.set(slug, {
    url: fallback,
    provider: 'pexels',
    fetchedAt: Date.now(),
  });

  return fallback;
}

export function getHowItWorksThumbnailCache() {
  return thumbnailCache;
}


