import { useEffect, useState } from "react";
import "./ImageModal.css"
import { UnsplashPhoto } from "../types/types";
type Props = { photo: UnsplashPhoto | null; onClose: () => void };

export default function ImageModal({ photo, onClose }: Props) {
    const [stats, setStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!photo) return;
        setLoading(true);
        const controller = new AbortController();
        (async () => {
            try {
                const res = await fetch(`https://api.unsplash.com/photos/${photo.id}`, {
                    headers: { Authorization: `Client-ID ${process.env.REACT_APP_YOUR_ACCESS_KEY}` },
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`Unsplash API error ${res.status}`);
                const data = await res.json();
                setStats(data);
            } catch (e: any) {
                if (e && e.name === "AbortError") return;
                setStats(null);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [photo]);

    if (!photo) return null;
    return (
        <>
            {/* background */}
            < div className="bg-light" onClick={onClose} />
            <div className="modal-overlay" onClick={onClose}>
                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>
                <div className="modal" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-body">
                        <img src={photo.urls.regular} alt={photo.alt_description ?? "photo"} />
                        <div className="modal-meta">
                            <p>By: {photo.user?.name ?? "Unknown"}</p>
                            <p>Likes: {stats?.likes ?? photo.likes ?? "NAN"}</p>
                            <p>Views: {stats?.views ?? "NAN"}</p>
                            <a>
                                Downloads: {stats?.downloads ?? "NAN"}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
