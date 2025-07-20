"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Star } from "lucide-react";
import { restaurantAPI } from "../../services/api";

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    rating: "",
    price_range: "100,000 - 300,000 VND",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
  });

  const priceRanges = [
    { label: "Tất cả mức giá", value: "" },
    { label: "100,000 - 300,000 VND", value: "100,000 - 300,000 VND" },
    { label: "500,000 - 800,000 VND", value: "500,000 - 800,000 VND" },
    { label: "1,000,000 - 1,500,000 VND", value: "1,000,000 - 1,500,000 VND" },
    { label: "Trên 1,800,000 VND", value: "Trên 1,800,000 VND" },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setForm((prev) => ({ ...prev, image: file }));
        setError(null); // reset lỗi nếu có
      } else {
        setError("Vui lòng chọn một file hình ảnh hợp lệ.");
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("rating", form.rating);

    // Tách giá
    
      formData.append("price_range", form.price_range);
      console.log(form.price_range);

    

    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("address", form.address);

    formData.append("image", form.image); // Đảm bảo là file

    try {
      await restaurantAPI.create(formData);
      navigate("/Admin/Restaurant");
    } catch (err) {
      console.error(err);
      console.log("Lỗi chi tiết từ Laravel:", err.response?.data);
      setError("Thêm nhà hàng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Thêm Nhà Hàng</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên */}
        <div>
          <label className="block font-medium">Tên nhà hàng</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block font-medium">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            rows={4}
            required
          />
        </div>

        {/* Đánh giá */}
        <div>
          <label className="block font-medium">Đánh giá</label>
          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">-- Chọn đánh giá --</option>
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star} sao
              </option>
            ))}
          </select>
        </div>

        {/* Mức giá */}
        <div>
          <label className="block font-medium">Giá</label>
          <select
            name="price_range"
            value={form.price_range}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price_range: e.target.value }))
            }
          >
            <option value="">Chọn mức giá</option>
            <option value="100,000 - 300,000 VND">100,000 - 300,000 VND</option>
            <option value="500,000 - 800,000 VND">500,000 - 800,000 VND</option>
            <option value="1,000,000 - 1,500,000 VND">
              1,000,000 - 1,500,000 VND
            </option>
            <option value="Trên 1,800,000 VND">Trên 1,800,000 VND</option>
          </select>
        </div>

        {/* Kinh độ & Vĩ độ */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Kinh độ</label>
            <input
              type="number"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              step="any"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Vĩ độ</label>
            <input
              type="number"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              step="any"
              min="-90"
              max="90"
              required
            />
          </div>
          {/* Địa chỉ */}
          <div>
            <label className="block font-medium">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>
        </div>

        {/* Hình ảnh */}
        <div>
          <label className="block font-medium">Hình ảnh</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Thêm Nhà Hàng"}
        </button>
      </form>
    </div>
  );
};

export default AddRestaurant;
