import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { UnsplashPhoto } from "../types";

type CacheEntry = { photos: UnsplashPhoto[]; ts: number };

const TTL = 1000 * 60 * 5; // 5 minutes
const STORAGE_KEY = "unsplash_cache_v1";
const cache = new Map<string, CacheEntry>();

// hydrate from sessionStorage
try {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    Object.entries(parsed).forEach(([k, v]) => cache.set(k, v));
  }
} catch (e) {
  // ignore
}

function persistCache() {
  try {
    const obj: Record<string, CacheEntry> = {};
    cache.forEach((v, k) => (obj[k] = v));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {}
}

export default function useUnsplash(
  query: string | null,
  page: number,
  mode: "search" | "popular" = "search"
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const cancelRef = useRef<any>(null);

  useEffect(() => {
    setPhotos([]);
    setHasMore(true);
  }, [query, mode]);

  useEffect(() => {
    const key = `${mode}:${query ?? "popular"}:page:${page}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < TTL) {
      setPhotos((prev) => {
        const merged = [...prev, ...cached.photos];
        const map = new Map(merged.map((p) => [p.id, p]));
        return Array.from(map.values());
      });
      setHasMore(cached.photos.length > 0);
      return;
    }

    setLoading(true);
    setError(null);
    if (cancelRef.current) cancelRef.current.cancel();
    cancelRef.current = axios.CancelToken.source();

    const per_page = 20;
    const url =
      mode === "popular"
        ? `https://api.unsplash.com/photos`
        : `https://api.unsplash.com/search/photos`;

    axios
      .get(url, {
        headers: { Authorization: `Client-ID ${process.env.REACT_APP_YOUR_ACCESS_KEY}` },
        params:
          mode === "popular"
            ? { page, per_page, order_by: "popular" }
            : { query, page, per_page },
        cancelToken: cancelRef.current.token,
      })
      .then((res) => {
        const results: UnsplashPhoto[] = mode === "popular" ? res.data : res.data.results ?? [];
        setPhotos((prev) => {
          const merged = [...prev, ...results];
          const map = new Map(merged.map((p) => [p.id, p]));
          return Array.from(map.values());
        });

        cache.set(key, { photos: results, ts: Date.now() });
        persistCache();

        setHasMore(results.length >= per_page);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(err.message ?? "Error");
      })
      .finally(() => setLoading(false));

    return () => {
      if (cancelRef.current) cancelRef.current.cancel();
    };
  }, [query, page, mode]);

  return { photos, loading, error, hasMore } as const;
}
