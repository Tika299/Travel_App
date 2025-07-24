// src/pages/oauth-success.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    const avatar = params.get("avatar");

    if (token && email) {
      // Lưu token và thông tin người dùng
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email, avatar }));

      // Điều hướng về trang chính
      navigate("/");
    } else {
      alert("Đăng nhập thất bại");
      navigate("/login");
    }
  }, []);

  return <p>Đang đăng nhập...</p>;
}
