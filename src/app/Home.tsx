import React, { useCallback, useEffect, useRef, useState } from "react";
import useUnsplash from "../shared/hooks/useUnsplash";
import useDebounce from "../shared/hooks/useDebounce";
import useInfiniteScroll from "../shared/hooks/useInfiniteScroll";
import ImageGrid from "../shared/components/ImageGrid";
import ImageModal from "../shared/components/ImageModal";
import { UnsplashPhoto } from "../shared/types/types";
import { pushHistory } from "../shared/types/history";

export default function Home() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 400);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UnsplashPhoto | null>(null);

  const mode = debounced.trim() === "" ? "popular" : "search";
  const { photos, loading, error, hasMore } = useUnsplash(
    debounced.trim() === "" ? null : debounced,
    page,
    mode as any
  );

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    if (debounced.trim()) {
      pushHistory(debounced.trim());

    }
  }, [debounced]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((p) => p + 1)
    };
  }, [loading, hasMore]);

  const setLastNode = useInfiniteScroll(loadMore, !loading && hasMore);

  return (
    <div>
      <div className="search-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search"
          className="search text-primary"
        />
      </div>

      <ImageGrid photos={photos} onImageClick={(p) => setSelected(p)} setLastNode={setLastNode} />

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      <ImageModal photo={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
