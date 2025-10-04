import { UnsplashPhoto } from "../types/types";

type Props = {
  photos: UnsplashPhoto[];
  onImageClick: (p: UnsplashPhoto) => void;
  setLastNode?: (node: Element | null) => void;
};

export default function ImageGrid({ photos, onImageClick, setLastNode }: Props) {
  return (
    <div className="container grid-container">
      <div className="bg-blur" />
      {photos.map((p, i) => {
        const isLast = setLastNode && i === photos.length - 1;
        return (
          <div key={p.id} className="img-container">
            <img
              ref={isLast ? ((n: Element | null) => setLastNode?.(n)) : undefined}
              src={p.urls.small}
              alt={p.alt_description ?? "photo"}
              onClick={() => onImageClick(p)}
              style={{ cursor: "pointer" }}
            />
          </div>
        );
      })}
    </div>
  );
}
