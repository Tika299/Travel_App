"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import RestaurantList from "./components/RestaurantList"
import TripPlanner from "./components/TripPlanner"
import Footer from "./components/Footer"
import Location from "./components/LocationGrid"
import HeroSection from "./components/HeroSection"
import LocationDetail from './components/LocationDetail';

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
            <Route path="/Location" element={<Location />}/>
            <Route path="/HeroSection" element={<HeroSection />}/>
            <Route path="/location/:id" element={<LocationDetail />} />

            {/* Add more routes as needed */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
