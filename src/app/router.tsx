import "./Router.css";
import Home from "./Home";
import History from "./History";

function App() {
  const path = window.location.pathname;

  // switch case
  let component = null;
  if (path === "/history")
     component = <History />;
  else component = <Home />;

  return (
    <div className={`bg-background text-primary`}>
      <header className="nav-container container">
        <div>
          <span>Photo Gallery</span>
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
    </div>
  );
}

export default App;
