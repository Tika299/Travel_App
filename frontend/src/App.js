"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import RestaurantList from "./components/RestaurantList"
import TripPlanner from "./components/TripPlanner"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<RestaurantList />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/TripPlanner" element={<TripPlanner />}/>
            {/* Add more routes as needed */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
