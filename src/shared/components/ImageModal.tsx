import React from "react";
import { UnsplashImage } from "../hooks/useApi";
import "./ImageModal.css";

type ImageModalProps = {
  image: UnsplashImage;
  onClose: () => void;
};

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <img 
          src={image.urls.regular} 
          alt={image.alt_description || "Image"} 
          className="modal-image"
        />
        <div className="modal-info">
          <h3>{image.alt_description || "Untitled"}</h3>
          <p className="modal-photographer">
            Photo by <strong>{image.user.name}</strong> (@{image.user.username})
          </p>
          <div className="modal-stats">
            <div className="stat-item">
              <span className="stat-label">👍 Likes:</span>
              <span className="stat-value">{image.likes.toLocaleString()}</span>
            </div>
            {image.downloads !== undefined && (
              <div className="stat-item">
                <span className="stat-label">⬇️ Downloads:</span>
                <span className="stat-value">{image.downloads.toLocaleString()}</span>
              </div>
            )}
            {image.views !== undefined && (
              <div className="stat-item">
                <span className="stat-label">👁️ Views:</span>
                <span className="stat-value">{image.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
