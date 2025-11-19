type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  tags: Set<string>;
};

type InflightEntry<T> = Promise<T>;

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, InflightEntry<unknown>>();

const DEFAULT_TTL = 60 * 1000; // 60 seconds

export interface FetchCacheOptions {
  /**
   * Cache lifetime in milliseconds. Defaults to 60s.
   */
  ttl?: number;
  /**
   * Skip cache and refetch.
   */
  force?: boolean;
  /**
   * Tags attached to the cache entry so callers can invalidate related data.
   */
  tags?: string[];
}

/**
 * Wraps an async fetcher with a simple in-memory cache + in-flight request deduplication.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchCacheOptions = {}
): Promise<T> {
  const now = Date.now();
  const ttl = options.ttl ?? DEFAULT_TTL;
  const tags = new Set(options.tags ?? []);

  if (!options.force) {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const pending = inflight.get(key) as InflightEntry<T> | undefined;
    if (pending) {
      return pending;
    }
  } else {
    cache.delete(key);
  }

  const request = fetcher()
    .then((data) => {
      cache.set(key, {
        data,
        expiresAt: Date.now() + ttl,
        tags,
      });
      inflight.delete(key);
      return data;
    })
    .catch((error) => {
      inflight.delete(key);
      cache.delete(key);
      throw error;
    });

  inflight.set(key, request);
  return request;
}

export function invalidateCacheByKey(key: string) {
  cache.delete(key);
  inflight.delete(key);
}

export function invalidateCacheByTags(tags: string[]) {
  if (!tags.length) {
    cache.clear();
    inflight.clear();
    return;
  }

  const tagSet = new Set(tags);
  for (const [key, entry] of cache.entries()) {
    const intersects = [...entry.tags].some((tag) => tagSet.has(tag));
    if (intersects) {
      cache.delete(key);
      inflight.delete(key);
    }
  }
}

export function clearFetchCache() {
  cache.clear();
  inflight.clear();
}

