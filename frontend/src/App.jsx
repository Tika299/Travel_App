import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReviewPage from "./pages/user/ReviewPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/review"
          element={
            <div className="max-w-full min-h-screen mx-auto">
              <ReviewPage />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
