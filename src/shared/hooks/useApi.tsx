import { useEffect, useState } from "react";

type CacheEntry = {
  images: string[];
  timestamp: number;
};

// In-memory cache shared
const cache = new Map<string, CacheEntry>();
const STORAGE_KEY = "useSearchCache:v1";
const TTL = 1000 * 60 * 5; // 5 minutes

// Try to hydrate cache from sessionStorage (if any)
try {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed: Record<string, CacheEntry> = JSON.parse(raw);
    Object.entries(parsed).forEach(([k, v]) => cache.set(k, v));
  }
} catch (e) {
  // ignore storage errors (e.g., SSR or blocked storage)
  console.log(e)
}

function persistCache() {
  try {
    const obj: Record<string, CacheEntry> = {};
    cache.forEach((v, k) => (obj[k] = v));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    // ignore
  }
}

export default function useSearch(query: string, pageNumber: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    setImages([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    let controller: AbortController | null = null;
    const key = `${query}::${pageNumber}`;
    // if cached and fresh, use it and skip network
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setImages(cached.images);
      setLoading(false);
      return;
    }
    controller = new AbortController();

    (async () => {
      try {
        const per_page = 20;
        const params = new URLSearchParams();
        if (query !== undefined && query !== null) params.append("query", String(query));
        params.append("page", String(pageNumber));
        params.append("per_page", String(per_page));

        const url = `https://api.unsplash.com/search/photos/?${params.toString()}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Client-ID ${process.env.REACT_APP_YOUR_ACCESS_KEY}`,
          },
          signal: controller!.signal,
        });

        if (!res.ok) throw new Error(`Unsplash API error ${res.status}`);

        const data = await res.json();
        const results = data?.results?.map((i: any) => i?.urls?.full) ?? [];

        setImages((prev) => {
          const merged = [...prev, ...results];
          return Array.from(new Set(merged));
        });
        setLoading(false);

        // store in cache (store page results)
        cache.set(key, { images: results, timestamp: Date.now() });
        persistCache();
      } catch (e: any) {
        if (e && e.name === "AbortError") return;
        setError(true);
      }
    })();

    return () => {
      if (controller) controller.abort();
    };
  }, [query, pageNumber]);
  return { loading, error, images };
}