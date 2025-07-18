"use client";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import RestaurantList from "./components/RestaurantList";
import TripPlanner from "./components/TripPlanner";
import Footer from "./components/Footer";
import Location from "./components/LocationGrid";
import HeroSection from "./components/HeroSection";
import LocationDetail from "./components/LocationDetail";
import AdminDishe from "./components/admin/FoodManagement";
import AdminLayout from "./components/admin/AdminLayout";
import AddFood from "./components/admin/AddFood";
import EditFood from "./components/admin/EditFood"

import "./App.css";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/Admin");
  const isAdminadd = location.pathname.startsWith("/Add");
  const isAdminedit = location.pathname.startsWith("/Edit");

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminPage && isAdminadd && isAdminedit && <Header />}

      <main>
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/TripPlanner" element={<TripPlanner />} />
          <Route path="/Location" element={<Location />} />
          <Route path="/HeroSection" element={<HeroSection />} />
          <Route path="/location/:id" element={<LocationDetail />} />
          <Route
            path="/AdminDishe"
            element={
              <AdminLayout>
                <AdminDishe />
              </AdminLayout>
            }
          />
          <Route
            path="/AddFood"
            element={
              <AdminLayout>
                <AddFood />
              </AdminLayout>
            }
          />
          <Route
            path="/EditFood/:id"
            element={
              <AdminLayout>
                <EditFood />
              </AdminLayout>
            }
          />
        </Routes>
      </main>

      {!isAdminPage && isAdminadd && isAdminedit &&<Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
