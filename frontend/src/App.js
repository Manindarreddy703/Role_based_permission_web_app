// src/App.js

import "./App.css";
import NavBar1 from "./components/NavBar1";
import NavBar2 from "./components/NavBar2"; // Import NavBar2
import Routes1 from "./components/Routes1";
import { useAuth } from "./context/AuthContext";

function App() {
    const { isAuthenticated } = useAuth(); // Get the authentication status

    return (
        <div className="App">
            {isAuthenticated ? <NavBar2 /> : <NavBar1 />} {/* Render based on authentication */}
            <Routes1 />
        </div>
    );
}

export default App;
