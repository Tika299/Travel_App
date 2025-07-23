import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cuisine from "./pages/ui/Cuisine";
import FoodList from "./pages/admin/FoodList";
import FoodCreate from "./pages/admin/FoodCreate";
import FoodEdit from "./pages/admin/FoodEdit";
import { Link } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import CuisineAll from "./pages/ui/CuisineAll";
import CulinaryDetail from "./pages/ui/CulinaryDetail";
import CategoryList from "./pages/admin/CategoryList";

// 👥 Public UI Pages
import HomePage from "./pages/ui/HomePage";
import TransportCompanyPage from "./pages/ui/TransportCompany/TransportCompanyPage";
import CheckinPlacePage from "./pages/ui/CheckinPlace/CheckinPlacePage";
import CheckinPlaceDetail from "./pages/ui/CheckinPlace/CheckinPlaceDetail";
import TransportCompanyDetail from "./pages/ui/TransportCompany/TransportCompanyDetail";
import FavouritePage from "./pages/ui/FavouritePage";
import ProfilePage from "./pages/ui/ProfilePage.jsx";
import HotelPageDetail from "./pages/ui/Hotel/HotelPageDetail.jsx";
import HotelList from "./pages/admin/Hotel/HotelList.jsx";
import HotelPage from "./pages/ui/Hotel/HotelPage.jsx";

import LoginPage from "./pages/ui/User/Login-page.jsx";
import RegistrationPage from "./pages/ui/User/Registration-page.jsx";
import ForgotPassWordPage from "./pages/ui/User/Forgot-password-page.jsx";
import VerifyPage from "./pages/ui/User/Verify-code-page.jsx";
import ResetPassWordPage from "./pages/ui/User/Reset-password-page.jsx";
//gôogle
import GoogleSuccess from "./pages/ui/User/GoogleSuccessPage.jsx";

// 🛠 Admin - TransportCompany
import AdminTransportCompanyList from "./pages/admin/TransportCompany/index";
import AdminTransportCompanyCreate from "./pages/admin/TransportCompany/create";
import AdminTransportCompanyEdit from "./pages/admin/TransportCompany/edit";

// 🛠 Admin - CheckinPlace
import AdminCheckinPlaceList from "./pages/admin/CheckinPlace/index";
import AdminCheckinPlaceCreate from "./pages/admin/CheckinPlace/create";
import AdminCheckinPlaceEdit from "./pages/admin/CheckinPlace/edit";

// 🛠 Admin - Transportation (New)
import AdminTransportationList from "./pages/admin/Transportation/index.jsx";
import AdminTransportationCreate from "./pages/admin/Transportation/create.jsx";
import AdminTransportationEdit from "./pages/admin/Transportation/edit.jsx";

import ReviewPage from "./pages/ui/ReviewPage.jsx";

import Sidebar from "./components/ui/schedule/Sidebar";
import CalendarFull from "./components/ui/schedule/CalendarFull";
import SchedulePage from "./components/ui/schedule/SchedulePage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC PAGES ===== */}
        <Route path="/" element={<HomePage />} />

        {/* Hotels */}
        <Route path="/admin/hotels" element={<HotelList />} />
        <Route path="/hotels" element={<HotelPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forgot_password" element={<ForgotPassWordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/resetpass" element={<ResetPassWordPage />} />
        {/* google */}
        <Route path="/google-success?token=" element={<GoogleSuccess />} />

        {/* 1. Đặt route /checkin-places/all LÊN TRƯỚC */}
        {/* Route này sẽ hiển thị tất cả các địa điểm, sử dụng cùng component CheckinPlacePage */}
        <Route
          path="/checkin-places/all"
          element={<CheckinPlacePage showAll={true} />}
        />

        {/* 2. Route /checkin-places (nếu có) cũng nên đứng trước route động có :id */}
        {/* Route này có thể dùng để hiển thị các địa điểm gợi ý hoặc trang chính */}
        <Route path="/checkin-places" element={<CheckinPlacePage />} />

        {/* 3. Đặt route động /checkin-places/:id XUỐNG DƯỚI CÙNG trong nhóm này */}
        <Route path="/checkin-places/:id" element={<CheckinPlaceDetail />} />

        <Route path="/transport-companies" element={<TransportCompanyPage />} />
        <Route
          path="/transport-companies/:id"
          element={<TransportCompanyDetail />}
        />
        <Route path="/favorites" element={<FavouritePage />} />

        {/* ===== ADMIN - Transport Companies ===== */}
        <Route
          path="/admin/transport-companies"
          element={<AdminTransportCompanyList />}
        />
        <Route
          path="/admin/transport-companies/create"
          element={<AdminTransportCompanyCreate />}
        />
        <Route
          path="/admin/transport-companies/edit/:id"
          element={<AdminTransportCompanyEdit />}
        />

        {/* ===== ADMIN - Checkin Places ===== */}
        <Route
          path="/admin/checkin-places"
          element={<AdminCheckinPlaceList />}
        />
        <Route
          path="/admin/checkin-places/create"
          element={<AdminCheckinPlaceCreate />}
        />
        <Route
          path="/admin/checkin-places/edit/:id"
          element={<AdminCheckinPlaceEdit />}
        />

        {/* ===== ADMIN - Transportation (New Routes) ===== */}
        <Route
          path="/admin/transportations"
          element={<AdminTransportationList />}
        />
        <Route
          path="/admin/transportations/create"
          element={<AdminTransportationCreate />}
        />
        <Route
          path="/admin/transportations/edit/:id"
          element={<AdminTransportationEdit />}
        />

        {/* Trang ẩm thực */}
        <Route path="/cuisine" element={<Cuisine />} />
        {/* Trang xem tất cả món ăn */}
        <Route path="/cuisine/all" element={<CuisineAll />} />
        {/* Trang chi tiết món ăn */}
        <Route path="/cuisine/:id" element={<CulinaryDetail />} />
        {/* Trang admin - danh sách món ăn */}
        <Route path="/admin/foods" element={<FoodList />} />
        {/* Trang admin - thêm ẩm thực */}
        <Route path="/admin/foods/create" element={<FoodCreate />} />
        {/* Trang admin - sửa ẩm thực */}
        <Route path="/admin/foods/:id/edit" element={<FoodEdit />} />
        {/* Trang admin - danh mục */}
        <Route path="/admin/categories" element={<CategoryList />} />

        {/* Trang review */}
        <Route path="/review" element={<ReviewPage />} />
        {/* Trang Hotel */}
        <Route path="/hotel/detail" element={<HotelPageDetail />} />

        {/* Trang cá nhân */}
        <Route path="/profile" element={<ProfilePage />} />
        {/* ===== LỊCH TRÌNH (SCHEDULE) ===== */}
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </Router>
  );
}

export default App;
