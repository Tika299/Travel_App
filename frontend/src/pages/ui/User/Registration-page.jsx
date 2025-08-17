"use client"

import { useState } from "react"
import { Eye, EyeOff, MapPin, Users, Star } from "lucide-react"
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"


export default function RegistrationPage() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google/redirect"
  };
  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/facebook/redirect";
  };
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(0) // đếm ngược gửi mã

  const navigate = useNavigate();
  //lấy trường dữ liệu 
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^0\d{8,9}$/ // VN: 9–10 số, bắt đầu từ 0
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  //xu ly nhấn nút gửi mã 
  const handleSendCode = async () => {
    if (!form.email) {
      toast.warning("⚠️ Vui lòng nhập email trước khi gửi mã xác nhận");
      return
    }

    try {
      const response = await axios.post("http://localhost:8000/api/send-code", {
        email: form.email,
      })
      toast.success("✅ " + response.data.message)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error("❌ Không gửi được mã xác nhận")
    }
  }

  // validate từng trường (live)
  const validateField = (name, value) => {
    let message = ""

    switch (name) {
      case "name":
        if (!value) message = "Tên không được bỏ trống"
        break

      case "email":
        if (!value) message = "Email không được bỏ trống"
        else if (!emailRegex.test(value)) message = "Email không hợp lệ (vd: ten@gmail.com)"
        break

      case "phone":
        if (!value) message = "Số điện thoại không được bỏ trống"
        else if (!phoneRegex.test(value))
          message = "Số điện thoại phải bắt đầu bằng 0 và có 9–10 số"
        break

      case "password":
        if (!value) message = "Mật khẩu không được bỏ trống"
        else if (!passwordRegex.test(value))
          message = "Mật khẩu ≥8 ký tự, gồm chữ, số và ký tự đặc biệt"
        break

      case "confirmPassword":
        if (value !== form.password) message = "Mật khẩu xác nhận không khớp"
        break

      case "otp":
        if (!value) message = "Vui lòng nhập mã OTP"
        break

      default:
        break
    }

    setErrors((prev) => ({ ...prev, [name]: message }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    validateField(name, value) // validate live
  }


  //kiểm tra trường nhập 
  const validateForm = () => {
    // Regex kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Regex kiểm tra số điện thoại VN (bắt đầu bằng 0, 9-10 số)
    const phoneRegex = /^0\d{8,9}$/;
    //Tối thiểu 8 ký tự,Phải có ít nhất 1 chữ cái, Ít nhất 1 chữ số, Ít nhất 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!form.name) {
      toast.warning("⚠️ Vui lòng nhập họ và tên");
      return false;
    }
    if (!form.email) {
      toast.warning("⚠️ Vui lòng nhập email");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("❌ Email không hợp lệ (ví dụ: ten@gmail.com)");
      return false;
    }
    if (!form.phone) {
      toast.warning("⚠️ Vui lòng nhập số điện thoại");
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      toast.error("❌ Số điện thoại không hợp lệ (phải bắt đầu bằng 0, 9-10 số)");
      return false;
    }
    if (!form.password) {
      toast.warning("⚠️ Vui lòng nhập mật khẩu");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("❌ Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (!form.confirmPassword) {
      toast.warning("⚠️ Vui lòng xác nhận mật khẩu");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("❌ Mật khẩu không khớp");
      return false;
    }
    if (!form.otp) {
      toast.warning("⚠️ Vui lòng nhập mã xác nhận (OTP)");
      return false;
    }

    return true;
  };


  //xu ly nut tạo tài khoản 
  const handleRegister = async (e) => {
    e.preventDefault();

    // validate toàn bộ trước khi gửi
    Object.keys(form).forEach((field) => validateField(field, form[field]))
    if (Object.values(errors).some((msg) => msg)) {
      toast.error("❌ Vui lòng nhập đầy đủ thông tin trước khi đăng ký")
      return
    }

    // loading
     const loadingToast = toast.loading("Đang đăng ký...")

     
    try {
      const res = await axios.post("http://localhost:8000/api/verify-code", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.confirmPassword,
        otp: form.otp,
      });

      toast.success("🎉 Tạo tài khoản thành công!");
      console.log(res.data.user);
      navigate("/login");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        otp: "",
      });
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error(
        "❌ Đăng ký thất bại: " +
        (error.response?.data?.message || "Lỗi không xác định")
      );
    }
  };




  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/img/bg_login.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 relative bg-gradient-to-br from-teal-600 to-teal-800 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{ backgroundImage: "url('/img/bg_login.jpg?height=600&width=400')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-800/90 to-teal-600/80"></div>
            </div>

            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col min-h-[500px] lg:min-h-[700px]">
              <div className="flex items-center mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                    <img src="/img/logo.png?height=32&width=32" alt="Logo" className="h-8 w-8" />
                  </div>
                </div>
                <span className="ml-3 font-bold text-xl">IPSUM TRAVEL</span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">Khám phá thế giới cùng chúng tôi</h2>
                <p className="mb-8 text-lg opacity-90 leading-relaxed">
                  Tham gia cộng đồng du lịch lớn nhất Việt Nam. Khám phá những điểm đến tuyệt vời, chia sẻ trải nghiệm
                  và tìm kiếm kỳ nghỉ không thể quên.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-4">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="text-lg">Hơn 1000+ điểm đến hấp dẫn</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-4">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-lg">Cộng đồng 500K+ du khách</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-4">
                      <Star className="h-5 w-5" />
                    </div>
                    <span className="text-lg">Đánh giá 4.9/5 từ người dùng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản</h1>
                <p className="text-gray-600">Bắt đầu hành trình khám phá của bạn</p>
              </div>

            <form className="space-y-4" onSubmit={handleRegister}>
              {/* <div className="grid grid-cols-2 gap-4"> */}
              <div>
                <label className="block text-sm mb-1">Họ và tên</label>
                <div className="relative">
                  {/* Họ và tên */}
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Họ và tên"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>

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
                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>

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
                  {/* Phone */}
                  <div>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Số điện thoại"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
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
                    {/* Password */}
                    <div>
                      <input
                        type={showPassword ? "text" : "password"}  
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                      />
                      <span
                        className="absolute right-3 top-3 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    {/* <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button> */}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    {/* Confirm Password */}
                    <div>
                      <input
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                      />
                      <span
                        className="absolute right-3 top-3 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>
                    {/* <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button> */}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-grow">
                  <label className="block text-sm mb-1">Nhập mã xác nhận</label>
                  {/* OTP */}
                  <div>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Nhập mã xác nhận"
                      value={form.otp}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                    {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0} // disable khi đang đếm ngược
                    className={`px-4 py-2 text-white rounded-md transition-colors ${countdown > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
                      }`}
                  >
                    {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi mã"}
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
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-36"
                >
                  <img src="/img/google.jpg?height=20&width=20" alt="Google" className="h-5 w-5 mr-2" />
                  <span>Google</span>
                </button>
                <button
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-36">
                  <img src="/img/facebook.jpg?height=20&width=20" alt="Facebook" className="h-5 w-5 mr-2" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}
