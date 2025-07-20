"use client";
import {
  BarChart3,
  Users,
  MapPin,
  Camera,
  Utensils,
  Car,
  Building,
  Calendar,
  MessageSquare,
  Settings,
} from "lucide-react";

const Sidebar = ({ activeMenu = "Admin/Restaurant", onMenuClick }) => {
  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "dashboard" },
    { icon: Users, label: "Quản lý người dùng", path: "users" },
    { icon: MapPin, label: "Điểm du lịch", path: "destinations" },
    { icon: Camera, label: "Điểm check-in", path: "checkin" },
    { icon: Utensils, label: "Ẩm thực", path: "food" },
    { icon: Car, label: "Phương tiện", path: "transport" },
    { icon: Building, label: "Khách sạn", path: "Admin/Restaurant" },// Chèn Đường link dô Để chuyển đúng trang
    { icon: Calendar, label: "Lịch trình", path: "schedule" },
    { icon: MessageSquare, label: "Bài viết", path: "articles" },
    { icon: MessageSquare, label: "Chatbot", path: "chatbot" },
    { icon: Settings, label: "Cài đặt", path: "settings" },
  ];

const handleMenuClick = (path) => {
    if (onMenuClick) {
      onMenuClick(path);
    }
  };

  return (
    <div className="w-64 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/image/sidebar-bg.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 p-6 h-full flex flex-col overflow-y-auto">
       {/* Logo */}
<div className="flex flex-col items-center gap-3 pt-4 pb-6">
  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
    <img
      src="/image/Logo.png"
      alt="Ipsum Travel Logo"
      className="w-16 h-16 object-contain"
    />
  </div>
  <div className="text-white text-xl font-bold tracking-wide">
    IPSUMTRAVEL
  </div>
</div>



        {/* Navigation */}
        <nav className="flex-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.path;
            return (
              <div
                key={index}
                onClick={() => handleMenuClick(item.path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-400 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
