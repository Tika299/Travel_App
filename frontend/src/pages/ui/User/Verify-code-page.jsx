"use client"

import { useState, useRef, useEffect } from "react"
import { Shield, Clock, Mail, HelpCircle } from "lucide-react"

export default function VerifyCodePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isExpired, setIsExpired] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef([])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsExpired(true)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleInputChange = (index, value) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join("")
    if (verificationCode.length !== 6) {
      alert("Vui lòng nhập đầy đủ 6 số")
      return
    }

    setIsVerifying(true)
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false)
      // Redirect to reset password page
      window.location.href = "/resetpass"
    }, 2000)
  }

  const handleResendCode = async () => {
    setIsResending(true)
    // Simulate API call
    setTimeout(() => {
      setIsResending(false)
      setTimeLeft(300)
      setIsExpired(false)
      setCode(["", "", "", "", "", ""])
      alert("Mã xác nhận mới đã được gửi!")
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background img */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundimg: "url('/img/pho-co-hoi-an.jpg?height=1080&width=1920')",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Verify Code Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex">
          {/* Left side - Verification info */}
          <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-teal-700 to-teal-800 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundimg: "url('/img/Pho.jpg?height=600&width=400')" }}
            ></div>

            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-center mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <img src="/img/Pho.jpg?height=32&width=32" alt="Logo" className="h-8 w-8" />
                </div>
                <span className="ml-3 font-bold text-lg">IPSUM TRAVEL</span>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Xác nhận danh tính</h2>
                <p className="mb-8 text-sm opacity-90 leading-relaxed">
                  Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng nhập mã để xác thực và tiếp tục.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Bảo mật 2 lớp</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Mã có hiệu lực 5 phút</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Gửi qua email bảo mật</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Verification form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-center mb-1">Quên mật khẩu?</h1>
              <p className="text-gray-500 text-center text-sm mb-6">
                Nhập email hoặc số điện thoại để nhận liên kết đặt lại mật khẩu
              </p>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm text-green-600 font-medium">Nhập thông tin</span>
                </div>
                <div className="w-8 h-px bg-green-600 mx-4"></div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                    2
                  </div>
                  <span className="ml-2 text-sm text-blue-600 font-medium">Xác nhận</span>
                </div>
                <div className="w-8 h-px bg-gray-300 mx-4"></div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                    3
                  </div>
                  <span className="ml-2 text-sm text-gray-500">Đặt lại</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold mb-2">Nhập mã xác nhận 6 số</h2>
              </div>

              {/* Code Input */}
              <div className="flex justify-center space-x-3 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isExpired}
                  />
                ))}
              </div>

              {/* Timer or Expired Message */}
              <div className="text-center mb-6">
                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm font-medium">Mã đã hết hạn</p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Mã sẽ hết hạn sau: <span className="font-mono font-bold text-blue-600">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || isExpired || code.join("").length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-md hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Xác nhận mã
                  </>
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center mb-4">
                <button
                  onClick={handleResendCode}
                  disabled={isResending || !isExpired}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Đang gửi..." : "Gửi lại mã"}
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Muốn thay đổi email?{" "}
                  <a href="/forgot_password" className="text-teal-600 hover:text-teal-500 font-medium">
                    Quay lại
                  </a>
                </p>

                <button className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
