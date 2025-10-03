import { useCallback, useEffect, useRef, useState } from "react";
import logo from "../shared/assets/logo.svg";
import useSearch from "../shared/hooks/useApi";
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
            component = <div>search</div>;
            break;
    }

    const [query, setQuery] = useState("");
    const [pageNumber, setPageNumber] = useState(1);

    const observer = useRef();
    const { loading, error, images } = useSearch(query, pageNumber);
    const lastImageElementRef = useCallback(
        (node: any) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    setPageNumber((prevPageNumber) => prevPageNumber + 1);
                    // console.log('visible');
                }
            });
            if (node) observer.current.observe(node);
            // console.log(node);
        },
        [loading]
    );

    function handleSearch(e: any) {
        setQuery(e.target.value);
        setPageNumber(1);
    }
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

            <div className="container grid-container">
                {/* bg-blur */}
                <div className="bg-blur" />
                {images.map((image, index) => {
                    return (
                        <div key={image} className="img-container">
                            <img 
                                ref={index === images.length - 1 ? lastImageElementRef : null} 
                                src={image} 
                                alt={image} 
                            />
                        </div>
                    )
                })}
                <div>{loading && "Loading..."}</div>
                <div>{error && "Error..."}</div>

                {/* <div>
          <img src="" alt="" />
          <p>image 1</p>
        </div>
        <div>
          <img src="" alt="" />
          <p>image 2</p>
        </div>
        <div>
          <img src="" alt="" />
          <p>image 3</p>
        </div> */}
            </div>
        </div>
    );
}
export default App;
