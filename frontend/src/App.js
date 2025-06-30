"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import RestaurantList from "./components/RestaurantList"
import TripPlanner from "./components/TripPlanner"
import Footer from "./components/Footer"
import Location from "./components/LocationGrid"
import HeroSection from "./components/HeroSection"
import LocationDetail from './components/LocationDetail';
//đăng ký
import RegistrationPage from './components/Registration-page';
//đăng nhập
import LoginnPage from './components/Login-page';
//quên mật khẩu 
import ForgotPassWordPage from './components/Forgot-password-page';
//xác thực
import VerifyPage from './components/Verify-code-page';
//đặt lại mật khẩu
import ResetPassWordPage from './components/Reset-password-page';

import "./App.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<RegistrationPage />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/TripPlanner" element={<TripPlanner />}/>
            <Route path="/Location" element={<Location />}/>
            <Route path="/HeroSection" element={<HeroSection />}/>
            <Route path="/location/:id" element={<LocationDetail />} />

            <Route path="/register" element={<RegistrationPage />} />

            <Route path="/login" element={<LoginnPage />} />

            <Route path="/forgot_password" element={<ForgotPassWordPage />} />

            <Route path="/verify" element={<VerifyPage />} />

            <Route path="/reset_password" element={<ResetPassWordPage />} />

            {/* Add more routes as needed */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
