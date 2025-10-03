import React, { useCallback, useEffect, useRef, useState } from "react";
import { getSearchHistory, SearchHistoryItem } from "../shared/utils/searchHistory";
import useSearch, { UnsplashImage } from "../shared/hooks/useApi";
import ImageModal from "../shared/components/ImageModal";
import "./HistoryPage.css";

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const { loading, error, images } = useSearch(selectedQuery, pageNumber);

  useEffect(() => {
    const historyData = getSearchHistory();
    setHistory(historyData);
  }, []);

  const lastImageElementRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  const handleQueryClick = (query: string) => {
    setSelectedQuery(query);
    setPageNumber(1);
  };

  const handleImageClick = (image: UnsplashImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ka-GE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="history-page">
      <div className="history-sidebar">
        <h2>საძიებო ისტორია</h2>
        {history.length === 0 ? (
          <p className="no-history">ისტორია ცარიელია</p>
        ) : (
          <ul className="history-list">
            {history.map((item, index) => (
              <li
                key={index}
                className={`history-item ${selectedQuery === item.query ? "active" : ""}`}
                onClick={() => handleQueryClick(item.query)}
              >
                <span className="history-query">{item.query}</span>
                <span className="history-date">{formatDate(item.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="history-results">
        {selectedQuery ? (
          <>
            <h2>შედეგები: "{selectedQuery}"</h2>
            <div className="grid-container">
              {images.map((image, index) => {
                const isLast = index === images.length - 1;
                return (
                  <div key={image.id} className="img-container" onClick={() => handleImageClick(image)}>
                    <img
                      ref={isLast ? lastImageElementRef : null}
                      src={image.urls.small}
                      alt={image.alt_description || "Image"}
                    />
                  </div>
                );
              })}
            </div>
            {loading && <div className="loading-text">იტვირთება...</div>}
            {error && <div className="error-text">შეცდომა...</div>}
          </>
        ) : (
          <div className="no-selection">
            <p>აირჩიეთ საძიებო სიტყვა ისტორიიდან</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  );
}
