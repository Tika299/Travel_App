// Header.jsx
import { FaMapMarkerAlt, FaRegCalendarAlt, FaUtensils, FaSearch, FaUser } from "react-icons/fa";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm px-4 py-2 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <span className="text-xl font-bold text-blue-400 italic mr-8">IPSUM TRAVEL</span>
        {/* Menu */}
        <nav className="flex items-center space-x-6 text-sm">
          <a href="#" className="flex items-center space-x-1 text-black hover:text-blue-400">
            <FaMapMarkerAlt className="text-base" />
            <span>Địa điểm</span>
          </a>
          <a href="#" className="flex items-center space-x-1 text-black hover:text-blue-400">
            <FaRegCalendarAlt className="text-base" />
            <span>Lịch trình</span>
          </a>
          <a href="#" className="flex items-center space-x-1 text-black hover:text-blue-400">
            <FaUtensils className="text-base" />
            <span>Ẩm thực</span>
          </a>
        </nav>
      </div>
      {/* Search */}
      <div className="flex-1 flex justify-center mx-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm điểm du lịch, khách sạn, nhà hàng..."
            className="w-full rounded-full bg-gray-100 px-5 py-2 pl-4 pr-10 text-sm outline-none"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
      </div>
      {/* Right section */}
      <div className="flex items-center space-x-4">
        <span className="text-black text-sm">🌐 VI</span>
        <div className="flex items-center space-x-2">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="avatar"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-black text-sm font-medium">Đỗ Đức Anh</span>
        </div>
      </div>
    </header>
  );
}