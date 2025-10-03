import { useCallback, useEffect, useRef, useState } from "react";
import useSearch, { UnsplashImage } from "../shared/hooks/useApi";
import { addToSearchHistory } from "../shared/utils/searchHistory";
import ImageModal from "../shared/components/ImageModal";
import HistoryPage from "./HistoryPage";
import "./router.css"
function App() {
    const [isHome, setIsHome] = useState(true);
    const path = window.location.pathname;
    
    useEffect(() => {
        if (path !== "/" && path !== "/home") {
            setIsHome(false)
        }
    }, [])

    let component;
    switch (path) {
        case "/history":
            component = <HistoryPage />;
            break;
    }

    const [query, setQuery] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const { loading, error, images } = useSearch(query, pageNumber);
    
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

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const newQuery = e.target.value;
        setQuery(newQuery);
        setPageNumber(1);
        
        if (newQuery.trim()) {
            addToSearchHistory(newQuery.trim());
        }
    }

    const handleImageClick = (image: UnsplashImage) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };
    return (
        <div className="bg-background text-primary ">
            <header className="nav-container container">
                <div>
                    <span>Photo Gallery</span>
                    {isHome ? (
                        <input
                            type="search"
                            placeholder="search here"
                            className="search text-primary"
                            value={query}
                            onChange={handleSearch}
                        />
                    ) :
                        <input
                            type="search"
                            placeholder="search here"
                            className="search text-primary"
                            value={query}
                            disabled
                            onChange={handleSearch}
                        />}
                </div>
                <nav>
                    <ul>
                        <li>
                            <a href="/home">Home Page</a>
                        </li>
                        <li>
                            <a href="/history">Search History</a>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="container">{component}</div>

            {isHome && (
                <div className="container grid-container">
                    <div className="bg-blur" />
                    {images.map((image, index) => {
                        const isLast = index === images.length - 1;
                        return (
                            <div 
                                key={image.id} 
                                className="img-container"
                                onClick={() => handleImageClick(image)}
                            >
                                <img
                                    ref={isLast ? lastImageElementRef : null}
                                    src={image.urls.small}
                                    alt={image.alt_description || "Image"}
                                />
                            </div>
                        );
                    })}
                    <div>{loading && "იტვირთება..."}</div>
                    <div>{error && "შეცდომა..."}</div>
                </div>
            )}

            {selectedImage && (
                <ImageModal image={selectedImage} onClose={handleCloseModal} />
            )}
        </div>
    );
}
export default App;
