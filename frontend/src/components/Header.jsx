import { Search, LogOut } from "lucide-react";
import { MapPin, CalendarDays, Soup } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Menu */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-500">IPSUM TRAVEL</h1>
            <nav className="hidden md:flex space-x-6">
              <a
                href="/"
                className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition-colors"
              >
                <MapPin className="w-5 h-5 mb-1" />
                <span className="text-sm">Địa điểm</span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition-colors"
              >
                <CalendarDays className="w-5 h-5 mb-1" />
                <span className="text-sm">Lịch trình</span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition-colors"
              >
                <Soup className="w-5 h-5 mb-1" />
                <span className="text-sm">Ẩm Thực</span>
              </a>
            </nav>
          </div>

          {/* Search */}
          <div className="flex items-center w-full max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm điểm du lịch, khách sạn, nhà hàng..."
                className="w-full rounded-full border border-gray-300 pl-5 pr-10 py-2 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Avatar + Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://i.pravatar.cc/40"
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700">
                Dô Đức Anh
              </span>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
