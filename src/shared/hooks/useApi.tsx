import { useEffect, useState } from "react";
import axios from "axios";

type CacheEntry = {
  images: string[];
  timestamp: number;
};

// In-memory cache shared across hook instances
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
  const [images, setImages] = useState([]);

  useEffect(() => {
    setImages([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    let cancel: any;
    const key = `${query}::${pageNumber}`;
    // if cached and fresh, use it and skip network
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setImages(cached.images);
      setLoading(false);
      return;
    }

    axios({
      method: "GET",
      url: `https://api.unsplash.com/search/photos/`,
      headers: {
        Authorization: `Client-ID ${process.env.REACT_APP_YOUR_ACCESS_KEY}`,
      },
      params: { query: query, page: pageNumber },
      cancelToken: new axios.CancelToken((c: any) => (cancel = c)),
    })
      .then((res: any) => {
        const newImages = [
          ...new Set([
            ...images,
            ...res?.data?.results?.map((i: any) => i?.urls?.full),
          ]),
        ];
        setImages(newImages)
        setLoading(false);

        // store in cache
        cache.set(key, { images: newImages, timestamp: Date.now() });
        persistCache();
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });
    return () => cancel();
  }, [query, pageNumber]);
  return { loading, error, images };
}