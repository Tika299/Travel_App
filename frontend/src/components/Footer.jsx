const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">IPSUM TRAVEL</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Khám phá và đặt chỗ những địa điểm du lịch tuyệt vời nhất Việt Nam. Chúng tôi mang đến trải nghiệm du lịch
              tốt nhất cho bạn.
            </p>
            <div className="flex space-x-3 mt-4">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-sm">f</div>
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-sm">📷</div>
              <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center text-sm">🐦</div>
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-sm">📺</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Điểm đến</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hạ Long
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hội An
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sapa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Phú Quốc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Đà Lạt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Đặt tour
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Đặt vé máy bay
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Đặt khách sạn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Thuê xe
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Bảo hiểm du lịch
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Điều khoản
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 IPSUM TRAVEL. All rights reserved.</p>
          <p className="mt-2">Hotline: 1900-1234 - Email: info@ipsumtravel.com</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
