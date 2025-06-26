"use client"

import { Search } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative h-96 bg-gradient-to-r from-orange-400 to-red-500 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trang_web_du_l_E1_BB_8Bch_IPSUM_TRAVEL.png-3Fc3F7yQXcousR6nZGVms1Wt10JWnm.jpeg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Khám phá trải nghiệm tuyệt vời</h1>
        <p className="text-lg md:text-xl text-center mb-8 max-w-2xl">
          Tìm kiếm và trải nghiệm những hoạt động độc đáo ở Việt Nam
        </p>

        {/* Search Form */}
        <div className="bg-white rounded-lg p-4 shadow-lg w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900">
              <option>Tỉnh/Thành phố</option>
              <option>Hà Nội</option>
              <option>TP.HCM</option>
              <option>Đà Nẵng</option>
            </select>

            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900">
              <option>Loại hình</option>
              <option>Du lịch</option>
              <option>Ẩm thực</option>
              <option>Giải trí</option>
            </select>

            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900">
              <option>Giá</option>
              <option>Dưới 100k</option>
              <option>100k - 500k</option>
              <option>Trên 500k</option>
            </select>
          </div>

          <button className="w-full md:w-auto mt-4 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Tìm kiếm
          </button>
        </div>
      </div>
    </section>
  )
}
