"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { restaurantAPI } from "../../services/api";

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    rating: "",
    price_range: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const priceRanges = [
    { label: "100,000 - 300,000 VND", value: "100,000 - 300,000 VND" },
    { label: "500,000 - 800,000 VND", value: "500,000 - 800,000 VND" },
    { label: "1,000,000 - 1,500,000 VND", value: "1,000,000 - 1,500,000 VND" },
    { label: "Trên 1,800,000 VND", value: "Trên 1,800,000 VND" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await restaurantAPI.getById(id);
        const restaurant = res.data.data;

        setForm({
          name: restaurant.name || "",
          description: restaurant.description || "",
          rating: restaurant.rating
            ? String(Math.round(restaurant.rating))
            : "",

          price_range: restaurant.price_range || "",
          address: restaurant.address || "",
          latitude: restaurant.latitude || "",
          longitude: restaurant.longitude || "",
          image: null,
        });
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu nhà hàng:", err);
        setError("Không thể tải dữ liệu nhà hàng.");
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setForm((prev) => ({ ...prev, image: file }));
        setError(null);
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
    formData.append("price_range", form.price_range);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("address", form.address);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await restaurantAPI.update(id, formData);
      navigate("/Admin/Restaurant");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      setError("Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Chỉnh sửa Nhà Hàng
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Các trường giống AddRestaurant */}
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

        <div>
          <label className="block font-medium">Đánh giá</label>
          <select
            name="rating"
            value={String(form.rating)}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">-- Chọn đánh giá --</option>
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={String(star)}>
                {star} sao
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Giá</label>
          <select
            name="price_range"
            value={form.price_range}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">-- Chọn mức giá --</option>
            {priceRanges.map((pr) => (
              <option key={pr.value} value={pr.value}>
                {pr.label}
              </option>
            ))}
          </select>
        </div>

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
        </div>

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

        <div>
          <label className="block font-medium">Hình ảnh (nếu muốn thay)</label>
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
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật Nhà Hàng"}
        </button>
      </form>
    </div>
  );
};

export default EditRestaurant;
