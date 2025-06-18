// Footer.jsx
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#10192B] text-white py-8 border-t border-[#22304A]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          {/* Logo & Social */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-blue-400 mb-2">IPSUM TRAVEL</h2>
            <p className="text-sm mb-2">
              Khám phá thế giới cùng chúng tôi.<br />
              Những chuyến đi đáng nhớ bắt đầu từ đây.
            </p>
            <div className="flex space-x-4 mt-2 text-xl text-blue-300">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaYoutube /></a>
              <a href="#"><FaTiktok /></a>
            </div>
          </div>
          {/* Links */}
          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Điểm đến</h3>
              <ul className="space-y-1 text-sm">
                <li>Hạ Long</li>
                <li>Hội An</li>
                <li>Sapa</li>
                <li>Phú Quốc</li>
                <li>Đà Lạt</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Dịch vụ</h3>
              <ul className="space-y-1 text-sm">
                <li>Đặt tour</li>
                <li>Đặt vé máy bay</li>
                <li>Đặt khách sạn</li>
                <li>Thuê xe</li>
                <li>Bảo hiểm du lịch</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Hỗ trợ</h3>
              <ul className="space-y-1 text-sm">
                <li>Liên hệ</li>
                <li>FAQ</li>
                <li>Chính sách</li>
                <li>Điều khoản</li>
                <li>Sitemap</li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-[#22304A]" />
        <div className="flex flex-col md:flex-row md:justify-between text-xs text-gray-400">
          <span>© 2024 IPSUM TRAVEL. All rights reserved.</span>
          <span>
            Hotline: 1900-1234 &nbsp; Email: info@ipsumtravel.com
          </span>
        </div>
      </div>
    </footer>
  );
}