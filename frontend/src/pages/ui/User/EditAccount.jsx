import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import axios from "axios";

const EditAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    created_at: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          created_at: user.created_at || "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const { created_at, ...payload } = formData; // Không gửi created_at

      await axios.put("http://localhost:8000/api/user", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Lưu thông tin thành công!");
      navigate("/account");
    } catch (error) {
      alert("Lỗi khi lưu thông tin");
      console.error(error);
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải dữ liệu...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow mt-8 px-4 md:px-0">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thông tin tài khoản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input name="email" value={formData.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo tài khoản</label>
              <input
                type="text"
                name="created_at"
                value={new Date(formData.created_at).toLocaleDateString("vi-VN")}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu (Bio)</label>
            <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>

          <div className="flex justify-end space-x-4">
            <button onClick={() => navigate("/account")} className="px-4 py-2 bg-gray-200 rounded-lg">Huỷ</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditAccount;
