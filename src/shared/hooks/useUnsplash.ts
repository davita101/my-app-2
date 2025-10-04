import { useEffect, useRef, useState } from "react";
import { UnsplashPhoto } from "../types/types";

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
  } catch (e) { }
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

  const cancelRef = useRef<AbortController | null>(null);

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
    // abort previous request if any
    if (cancelRef.current) cancelRef.current.abort();
    const controller = new AbortController();
    cancelRef.current = controller;

    (async () => {
      const per_page = 20;
      const url =
        mode === "popular"
          ? `https://api.unsplash.com/photos`
          : `https://api.unsplash.com/search/photos`;

      const paramsObj: Record<string, any> =
        mode === "popular"
          ? { page, per_page, order_by: " " }
          : { query, page, per_page };
      const search = new URLSearchParams();
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null) search.append(k, String(v));
      });

      const fetchUrl = `${url}?${search.toString()}`;
      try {
        const res = await fetch(fetchUrl, {
          headers: { Authorization: `Client-ID ${process.env.REACT_APP_YOUR_ACCESS_KEY}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Unsplash API error ${res.status}`);
        const data = await res.json();
        const results: UnsplashPhoto[] = mode === "popular" ? data : data.results ?? [];

        setPhotos((prev) => {
          const merged = [...prev, ...results];
          const map = new Map(merged.map((p) => [p.id, p]));
          return Array.from(map.values());
        });

        cache.set(key, { photos: results, ts: Date.now() });
        persistCache();

        setHasMore(results.length >= per_page);
      } catch (err: any) {
        if (err && err.name === "AbortError") return;
        setError(err?.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (cancelRef.current) cancelRef.current.abort();
    };
  }, [query, page, mode]);

  return { photos, loading, error, hasMore } as const;
}
