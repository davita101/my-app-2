import React, { useCallback, useEffect, useState } from "react";
import { getHistory, clearHistory, removeHistoryItem } from "../shared/types/history";
import useUnsplash from "../shared/hooks/useUnsplash";
import useInfiniteScroll from "../shared/hooks/useInfiniteScroll";
import ImageGrid from "../shared/components/ImageGrid";
import ImageModal from "../shared/components/ImageModal";
import { UnsplashPhoto } from "../shared/types/types";
import "./History.css"

export default function History() {
    const [history, setHistory] = useState<string[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    function handleClear() {
        const ok = window.confirm("Clear all search history?");
        if (!ok) return;
        clearHistory();
        setHistory([]);
        setSelectedTerm(null);
        setPage(1);
    }

    useEffect(() => {
        setPage(1);
    }, [selectedTerm]);

    const { photos, loading, error, hasMore } = useUnsplash(selectedTerm ?? null, page, "search");

    const loadMore = useCallback(() => {
        if (!loading && hasMore) setPage((p) => p + 1);
    }, [loading, hasMore]);

    const setLastNode = useInfiniteScroll(loadMore, !loading && hasMore);

    return (
        <div>
            <div className={` ${photos.length < 1 && "h-screen"} `}>
                <h3>Search History</h3>
                {history.length === 0 && <p>No history yet</p>}
                <div className="history-controls">
                    {history.length > 0 && (
                        <button className="clear-history" onClick={handleClear}>
                            Clear history
                        </button>
                    )}
                </div>
                <ul className="history-list">
                    {history.map((h) => (
                        <li key={h} className="history-item">
                            <span className="history-term" onClick={() => setSelectedTerm(h)}>{h}</span>
                            <button
                                className="history-delete"
                                aria-label={`Delete ${h}`}
                                onClick={() => {
                                    const ok = window.confirm(`Delete "${h}" from history?`);
                                    if (!ok) return;
                                    removeHistoryItem(h);
                                    setHistory((prev) => prev.filter((x) => x !== h));
                                    if (selectedTerm === h) {
                                        setSelectedTerm(null);
                                        setPage(1);
                                    }
                                }}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedTerm && <h4>Results for: {selectedTerm}</h4>}

            <ImageGrid photos={photos} onImageClick={(p) => setSelectedPhoto(p)} setLastNode={setLastNode} />

            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}

            <ImageModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
    );
}
