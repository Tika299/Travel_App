"use client";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import RestaurantList from "./components/RestaurantList";
import TripPlanner from "./components/TripPlanner";
import Footer from "./components/Footer";
import Location from "./components/LocationGrid";
import HeroSection from "./components/HeroSection";
import LocationDetail from "./components/LocationDetail";
import AdminLayout from "./components/admin/AdminLayout";
import RestaurantManagement from "./components/admin/RestaurantManagement";
import AddRestaurant from "./components/admin/AddRestaurant";
import EditRestaurant from "./components/admin/EditRestaurant";
import Sidebar from "./components/admin/Sidebar";






import "./App.css";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/Admin");

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminPage && <Header />}

      <main>
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/TripPlanner" element={<TripPlanner />} />
          <Route path="/Location" element={<Location />} />
          <Route path="/Sidebar" element={<Sidebar />} />


          <Route path="/HeroSection" element={<HeroSection />} />
          <Route path="/location/:id" element={<LocationDetail />} />
           <Route
            path="/Admin/Sidebar"
            element={
              <AdminLayout>
              </AdminLayout>
            }
          />
          <Route
            path="/Admin/Restaurant"
            element={
              <AdminLayout>
                <RestaurantManagement />
              </AdminLayout>
            }
          />
          <Route
            path="/Admin/EditRestaurant/:id"
            element={
              <AdminLayout>
                <EditRestaurant />
              </AdminLayout>
            }
          />
          <Route
            path="/Admin/AddRestaurant"
            element={
              <AdminLayout>
                <AddRestaurant />
              </AdminLayout>
            }
          />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
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
