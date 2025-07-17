import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaRegCalendarAlt, FaUtensils, FaSearch, FaBars, FaStar, FaHeart } from "react-icons/fa";
import { TbChefHat } from "react-icons/tb";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow flex flex-col items-center justify-between px-4 py-2 md:px-8 sticky top-0 z-20">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 mr-4">
          <span className="text-2xl font-bold italic text-blue-500 select-none">
            IPSUM <span className="not-italic">TRAVEL</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/checkin-places" className="flex items-center text-black hover:text-blue-500 font-medium">
            <FaMapMarkerAlt className="mr-1" /> Địa điểm
          </Link>
          <Link to="/checkin-places/all" className="flex items-center text-black hover:text-blue-500 font-medium">
            <FaRegCalendarAlt className="mr-1" /> Lịch trình
          </Link>
          <Link to="/cuisine" className="flex items-center text-black hover:text-blue-500 font-medium">
            <FaUtensils className="mr-1" /> Ẩm thực
          </Link>
          <Link to="/admin/checkin-places" className="flex items-center text-black hover:text-blue-500 font-medium">
            <TbChefHat className="mr-1" /> Nhà hàng/Quán ăn
          </Link>
          <Link to="/admin/cuisine" className="flex items-center text-black hover:text-blue-500 font-medium">
            <FaStar className="mr-1" /> Review
          </Link>
          <Link to="/favorites" className="flex items-center text-black hover:text-blue-500 font-medium">
            <FaHeart className="mr-1" /> Yêu thích
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex-1 mx-4 hidden md:flex">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm điểm du lịch, khách sạn, nhà hàng..."
              className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition">Đăng nhập</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">Đăng ký</button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-blue-500 focus:outline-none">
            <FaBars />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start px-4 py-4 space-y-3 md:hidden z-50 animate-fade-in">
            <Link to="/checkin-places" className="flex items-center text-black hover:text-blue-500 font-medium w-full" onClick={() => setMenuOpen(false)}>
              <FaMapMarkerAlt className="mr-2" /> Địa điểm
            </Link>
            <Link to="/checkin-places/all" className="flex items-center text-black hover:text-blue-500 font-medium w-full" onClick={() => setMenuOpen(false)}>
              <FaRegCalendarAlt className="mr-2" /> Lịch trình
            </Link>
            <Link to="/cuisine" className="flex items-center text-black hover:text-blue-500 font-medium w-full" onClick={() => setMenuOpen(false)}>
              <FaUtensils className="mr-2" /> Ẩm thực
            </Link>
            <Link to="/admin/checkin-places" className="flex items-center text-black hover:text-blue-500 font-medium w-full" onClick={() => setMenuOpen(false)}>
              <TbChefHat className="mr-2" /> Nhà hàng/Quán ăn
            </Link>
            <Link to="/admin/cuisine" className="flex items-center text-black hover:text-blue-500 font-medium w-full" onClick={() => setMenuOpen(false)}>
              <FaStar className="mr-2" /> Review
            </Link>
            <Link to="/favorites" className="flex items-center text-black hover:text-blue-500 font-medium w-full" onClick={() => setMenuOpen(false)}>
              <FaHeart className="mr-2" /> Yêu thích
            </Link>
            <div className="w-full">
              <div className="relative w-full mt-2 mb-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm du lịch, khách sạn, nhà hàng..."
                  className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <Link to="/login" className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition mb-2">Đăng nhập</Link>
            <Link to="/register" className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">Đăng ký</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;