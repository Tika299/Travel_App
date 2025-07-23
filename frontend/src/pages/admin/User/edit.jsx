"use client"

import { useState } from "react"
import { Bell, Eye, EyeOff, ArrowLeft, RotateCcw, Save, Phone, Settings } from "lucide-react"

const EditUserForm = ({ user, onClose }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "Nguyễn Văn A",
    gender: user?.gender || "",
    phone: user?.phone || "0987654321",
    bio: user?.bio || "1234567890abcdefg",
    email: user?.email || "email@gmail.com",
    password: "",
    confirmPassword: "",
    birthDate: user?.birthDate || "",
    role: user?.role || "Admin",
    status: user?.status || "Hoạt động",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log("Updating user:", formData)
    // Handle form submission logic here
  }

  const handleReset = () => {
    setFormData({
      name: user?.name || "Nguyễn Văn A",
      gender: user?.gender || "",
      phone: user?.phone || "0987654321",
      bio: user?.bio || "1234567890abcdefg",
      email: user?.email || "email@gmail.com",
      password: "",
      confirmPassword: "",
      birthDate: user?.birthDate || "",
      role: user?.role || "Admin",
      status: user?.status || "Hoạt động",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Chỉnh sửa thông tin người dùng</h1>
            <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin người dùng trong hệ thống</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="border-b bg-blue-50 p-6">
              <div className="flex items-center text-blue-700">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Thông tin người dùng</h2>
                  <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin để chỉnh sửa tài khoản</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin cá nhân</h3>

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl text-gray-400">A</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Thay đổi ảnh đại diện</button>
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập họ tên..."
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Gender and Birth Date */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Nhập số điện thoại..."
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      placeholder="Nhập Bio..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin tài khoản</h3>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Nhập địa chỉ email..."
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role and Status */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vai Trò</label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn vai trò</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Moderator">Moderator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn trạng thái</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Tạm khóa">Tạm khóa</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleSubmit}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Đặt lại
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Thoát
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUserForm
