"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ApiService } from "../../services/api";

const EditFood = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    is_best_seller: false,
    restaurant_id: "",
    category: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDish, resRestaurants, resDishes] = await Promise.all([
          ApiService.getDish(id),
          ApiService.getRestaurants(),
          ApiService.getDishes(),
        ]);

        const dish = resDish.data.data;
        setFormData({
          name: dish.name || "",
          price: dish.price || "",
          description: dish.description || "",
          image: null, // Không cần set ảnh cũ
          is_best_seller: dish.is_best_seller === 1,
          restaurant_id: dish.restaurant_id || "",
          category: dish.category || "",
        });

        setRestaurants(resRestaurants.data.data);
        setCategories(resDishes.data.categories || []);
      } catch (err) {
        setError("Không thể tải dữ liệu món ăn hoặc danh sách.");
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const updatedData = new FormData();
    for (const key in formData) {
      if (key === "is_best_seller") {
        updatedData.append(key, formData[key] ? 1 : 0);
      } else if (formData[key] !== null) {
        updatedData.append(key, formData[key]);
      }
    }

    try {
      await ApiService.updateDish(id, updatedData);
      setSuccess(true);
      setTimeout(() => navigate("/AdminDishe"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})
            .flat()
            .join(", ") ||
          "Cập nhật thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-white rounded-none shadow-none mt-0">
      <button
        onClick={() => navigate("/AdminDishe")}
        className="mb-4 flex items-center text-blue-500"
      >
        <ArrowLeft className="mr-2" /> Quay lại danh sách
      </button>

      <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa món ăn</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">Cập nhật thành công!</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tên món ăn</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Giá</label>
          <input
            type="number"
            name="price"
            required
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Thay ảnh (nếu cần)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_best_seller"
            checked={formData.is_best_seller}
            onChange={handleChange}
          />
          <label className="font-medium">Món bán chạy</label>
        </div>

        <div>
          <label className="block font-medium mb-1">Nhà hàng</label>
          <select
            name="restaurant_id"
            required
            value={formData.restaurant_id}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">-- Chọn nhà hàng --</option>
            {restaurants.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Loại món</label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">-- Chọn loại món --</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật món ăn"}
        </button>
      </form>
    </div>
  );
};

export default EditFood;
