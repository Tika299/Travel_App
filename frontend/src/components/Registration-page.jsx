"use client"

import { useState } from "react"
import { Eye, EyeOff, MapPin, Users, Star } from "lucide-react"

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-r from-cyan-700 to-blue-900">
      <div className="flex w-full max-w-6xl mx-auto my-8 bg-white rounded-lg overflow-hidden shadow-xl">
        {/* Left side - Travel info */}
        <div className="hidden md:block w-1/2 relative bg-cyan-800 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/image/Pho.jpg?height=800&width=600')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/70 to-cyan-800/90"></div>
          </div>

          <div className="relative z-10 p-8 h-full flex flex-col">
            <div className="flex items-center mb-12">
              <div className="bg-white p-2 rounded-lg">
                <img src="/image/Pho.jpg?height=40&width=40" alt="Logo" className="h-10 w-10" />
              </div>
              <span className="ml-3 font-bold text-xl">IPSUM TRAVEL</span>
            </div>

            <div className="mt-auto">
              <h2 className="text-3xl font-bold mb-4">Khám phá thế giới cùng chúng tôi</h2>
              <p className="mb-8 text-sm opacity-90">
                Tham gia cộng đồng du lịch lớn nhất Việt Nam. Khám phá những điểm đến tuyệt vời, chia sẻ trải nghiệm và
                tìm kiếm kỳ nghỉ không thể quên.
              </p>

              <div className="space-y-4 mt-8">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Hơn 1000+ điểm đến hấp dẫn</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  <span>Cộng đồng 500K+ du khách</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-3" />
                  <span>Đánh giá 4.9/5 từ người dùng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Registration form */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center mb-1">Tạo tài khoản</h1>
            <p className="text-gray-500 text-center text-sm mb-6">Bắt đầu hành trình khám phá của bạn</p>

            <form className="space-y-4">
              {/* <div className="grid grid-cols-2 gap-4"> */}
                <div>
                  <label className="block text-sm mb-1">Họ và tên</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              {/* </div> */}

              <div>
                <label className="block text-sm mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Số điện thoại</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+84 123 456 789"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-grow">
                  <label className="block text-sm mb-1">Nhập mã xác nhận</label>
                  <input
                    type="text"
                    placeholder="Nhập mã xác nhận"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Gửi mã
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-gradient-to-r from-blue-700 to-cyan-600 text-white rounded-md hover:from-blue-800 hover:to-cyan-700 transition-colors font-medium"
              >
                Tạo tài khoản
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Đăng nhập
                </a>
              </p>

              <div className="mt-4 text-sm text-gray-500">Hoặc đăng ký với</div>

              <div className="mt-4 flex justify-center space-x-4">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-36">
                  <img src="/image/google.jpg?height=20&width=20" alt="Google" className="h-5 w-5 mr-2" />
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-36">
                  <img src="/image/facebook.jpg?height=20&width=20" alt="Facebook" className="h-5 w-5 mr-2" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
