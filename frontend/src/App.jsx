import React from "react";
import HomePage from "./pages/ui/HomePage";
import FavouritePage from "./pages/ui/FavouritePage";
import Sidebar from "./components/Sidebar";
function App() {
  return (
    <div className="app">
      {/* <Sidebar /> */}
      <HomePage />
      {/* You can add more pages or components here as needed */}
      {/* <FavouritePage /> */}
    </div>
  );
}

export default App;
